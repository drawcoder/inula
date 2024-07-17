/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { join, isAbsolute } from 'path';
import Config from '../config/Config.js';
import { BuildConfig, DevBuildConfig, DevProxy, ICommand, UserConfig } from '../types/types.js';
import { ServiceStage } from '../enum/enum.js';
import Plugin from '../plugin/Plugin.js';
import { appendFile, existsSync } from 'fs';
import { createRequire } from 'module';
import { Logger, LogLevel } from '../utils/logger.js';
import { loadModule } from '../utils/loadModule.js';
import readDirectory from '../utils/readDirectory.js';
import path from 'path';
import { fileURLToPath } from 'url';
import yargsParser from 'yargs-parser';
import { PackageJSON } from 'resolve';
import { loadPkg } from '../utils/loadPkg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

interface HubOpts {
  cwd?: string;
  logger?: Logger;
}

export default class Hub {
  args: any;
  cwd: string;
  env: string | undefined;
  configManager: Config;
  userConfig: UserConfig = {};
  packageJson: PackageJSON;
  stage: ServiceStage = ServiceStage.uninitialized;
  buildConfig: { name: string; config: Record<string, unknown> }[] = [];
  pluginManager: Plugin;
  buildConfigPath: BuildConfig[] = [];
  devBuildConfig: Record<string, unknown> = {};
  compileMode = '';
  builtInPlugins: string[] = [];
  pluginPaths: string[] = [];
  devProxy: DevProxy | null = null;
  logger: Logger;

  [key: string]: any;

  constructor(opts: HubOpts) {
    this.setStage(ServiceStage.constructor);
    this.cwd = opts.cwd || process.cwd();
    this.env = process.env.NODE_ENV;

    if (!opts.logger) {
      this.logger = new Logger(LogLevel.INFO);
    } else {
      this.logger = opts.logger;
    }

    this.packageJson = loadPkg(path.join(this.cwd, './package.json'));

    this.configManager = new Config({
      cwd: this.cwd,
      isLocal: this.env === 'development',
      logger: this.logger,
    });

    this.pluginManager = new Plugin({
      cwd: this.cwd,
      hub: this,
      logger: this.logger,
    });
  }

  setStage(stage: ServiceStage) {
    this.stage = stage;
  }

  async init() {
    this.setStage(ServiceStage.init);

    // 获取用户配置
    this.userConfig = await this.configManager.getUserConfig();

    // 设置编译模式
    this.setCompileMode();

    // 获取编译配置
    await this.analyzeBuildConfig();

    this.setStage(ServiceStage.initPlugins);
    this.builtInPlugins = this.getBuiltInPlugins();
    await this.pluginManager.register(this.builtInPlugins, this.userConfig.plugins);

    this.setStage(ServiceStage.initHooks);
    this.pluginManager.initHook();
  }

  getBuiltInPlugins(): string[] {
    return readDirectory(path.resolve(__dirname, '../builtInPlugins'));
  }

  async run({ command, args }: { command: string | number; args: yargsParser.Arguments }) {
    args._ = args._ || [];
    if (args._[0] === command) {
      args._.shift();
    }

    this.args = args;

    await this.init();

    this.setStage(ServiceStage.run);
    return this.runCommand({ command, args });
  }

  async runCommand({ command, args }: { command: string | number; args: yargsParser.Arguments }) {
    this.logger.debug(`run command ${command}`);

    const commands =
      typeof this.pluginManager.commands[command] === 'string'
        ? this.pluginManager.commands[this.pluginManager.commands[command] as string]
        : this.pluginManager.commands[command];

    if (commands === undefined) {
      this.logger.error(`Invalid command ${command}`);
      return;
    }
    const { fn } = commands as ICommand;

    return fn(args, this.pluginManager.store[command]);
  }

  setCompileMode() {
    this.compileMode = this.userConfig.compileMode || 'webpack';
    this.logger.debug(`current compile mode is ${this.compileMode}`);
  }

  async analyzeBuildConfig() {
    if (this.userConfig.devBuildConfig) {
      let { path } = this.userConfig.devBuildConfig;
      const { env } = this.userConfig.devBuildConfig;
      path = isAbsolute(path) ? path : join(process.cwd(), path);
      if (!existsSync(path)) {
        this.logger.warn(`Cant't find dev build config. Path is ${path}`);
        return;
      }
      this.logger.debug(`Find dev build config. Path is ${path}`);
      const bc = await loadModule<Record<string, unknown> | ((...args: any[]) => any)>(path);
      if (bc == undefined) {
        return;
      }

      let finalBc = {};
      if (typeof bc === 'function') {
        finalBc = bc(env);
        this.devBuildConfig = finalBc;
        return;
      }
      this.devBuildConfig = bc;

      if (this.userConfig.devBuildConfig.devProxy) {
        this.devProxy = this.userConfig.devBuildConfig.devProxy;
      }
    }

    if (!this.userConfig.buildConfig) {
      switch (this.compileMode) {
        case 'webpack':
          this.buildConfigPath.push({ name: 'default', path: './webpack.config.js' });
          break;
        case 'vite':
          this.buildConfigPath.push({ name: 'default', path: './vite.config.js' });
          break;
        default:
          this.logger.warn(`Unknown compile mode ${this.compileMode}`);
          break;
      }
    } else {
      this.userConfig.buildConfig.forEach(userBuildConfig => {
        if (typeof userBuildConfig === 'object') {
          this.buildConfigPath.push(userBuildConfig);
        }
      });
    }

    this.buildConfigPath.forEach(async config => {
      let { path } = config;
      const { name } = config;
      path = isAbsolute(path) ? path : join(process.cwd(), path);
      if (!existsSync(path)) {
        this.logger.debug(`Cant't find build config. Path is ${path}`);
        return;
      }
      this.logger.debug(`Find build config. Path is ${path}`);
      const bc = await loadModule<Record<string, unknown> | ((...args: any[]) => any)>(path);
      if (bc == undefined) {
        return;
      }

      let finalBc = {};
      if (typeof bc === 'function') {
        finalBc = bc(config.env);
        this.buildConfig.push({ name: name, config: finalBc });
        return;
      }
      this.buildConfig.push({ name: name, config: bc });
    });
  }

  getConfigName(name: string): string {
    name = name.replace('webpack.', '');
    name = name.replace('.js', '');
    name = name.replace('.ts', '');
    return name;
  }
}

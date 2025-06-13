import { pathToFileURL } from 'url';
import { join, isAbsolute } from 'path';
import fs from 'fs';
import buildConfig from './build.js';
import { createRequire } from 'module';
import dynamicImport from './dynamicImport.js';
const require = createRequire(import.meta.url);

export async function loadModule<T>(filePath: string): Promise<T | undefined> {
  filePath = isAbsolute(filePath) ? filePath : join(process.cwd(), filePath);

  const isTsFile: boolean = filePath.endsWith('ts');
  const isJsFile: boolean = filePath.endsWith('js');


  let content: T | undefined;

  // js文件，可以直接通过import引用
  if (isJsFile) {
    content = (await dynamicImport(filePath))?.default;
  }

  // 如果是ts文件，需要先转为js文件，再读取
  if (isTsFile) {
    const code = await buildConfig(filePath, 'esm');
    content = await getTypescriptModule(code, filePath);
  }

  return content;
}

async function getTypescriptModule(code: string, filePath: string, isEsm = true) {
  const tempFile = `${filePath}.${isEsm ? 'm' : 'c'}js`;
  let content = null;

  // todo 臨時文件管理
  fs.writeFileSync(tempFile, code);

  delete require.cache[require.resolve(tempFile)];

  try {
    const raw = isEsm ? await dynamicImport(tempFile) : require(tempFile);
    content = raw?.default ?? raw;
  } catch (err: unknown) {
    fs.unlinkSync(tempFile);
    if (err instanceof Error) {
      err.message = err.message.replace(tempFile, filePath);
      err.stack = err.stack?.replace(tempFile, filePath);
    }
    throw err;
  }

  // todo 刪除失敗加日誌
  fs.unlinkSync(tempFile);

  return content;
}

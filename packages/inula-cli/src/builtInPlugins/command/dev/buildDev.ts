import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { createServer } from 'vite';
import { API } from '../../../types/types';
import setupProxy from '../../../utils/setupProxy.js';


export default (api: API) => {
  api.registerCommand({
    name: 'dev',
    description: 'build application for development',
    initialState: api.devBuildConfig,
    fn: async function (args: any, state: any) {
      api.applyHook({ name: 'beforeDevConfig' });
      switch (api.compileMode) {
        case 'webpack':
          if (state) {
            api.applyHook({ name: 'beforeDevCompile', config: state });
            const compiler = webpack(state);

            const devServerOptions: WebpackDevServer.Configuration = {
              client: {
                overlay: false,
              },
              host: 'localhost',
              port: '8888',
              open: true,
              historyApiFallback: true,
            };

            if (api.userConfig.devBuildConfig.devProxy) {
              devServerOptions.onBeforeSetupMiddleware = (devServer: WebpackDevServer) => {
                setupProxy(devServer.app, api)
              }
            }

            api.applyHook({
              name: 'beforeStartDevServer',
              config: { compiler: compiler, devServerOptions: devServerOptions },
            });
            const server = new WebpackDevServer(compiler, devServerOptions);
            server.startCallback((err: any) => {
              api.applyHook({ name: 'afterStartDevServer' });
            });
          } else {
            api.logger.error("Can't find config");
          }
          break;
        case 'vite':
          if (state) {
            await createServer(state)
              .then(server => {
                return server.listen();
              })
              .then(server => {
                server.printUrls();
              });
          } else {
            api.logger.error("Can't find config");
          }
          break;
      }
    },
  });
};

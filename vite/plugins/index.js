import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'url';
import vueI18n from '@intlify/vite-plugin-vue-i18n';

import createAutoImport from './auto-import';
import createSvgIcon from './svg-icon';
import createCompression from './compression';
import createSetupExtend from './setup-extend';
import { createHtmlPlugin } from 'vite-plugin-html';
import { loadEnv } from 'vite';

export default function createVitePlugins(viteEnv, isBuild = false, mode) {
  const env = loadEnv(mode, process.cwd());
  const vitePlugins = [
    vue(),
    vueJsx(),
    vueI18n({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './path/to/src/locales/**'),
    }),
    createHtmlPlugin({
      inject: {
        data: {
          title: env.VITE_APP_TITLE,
        },
      },
    }),
  ];
  vitePlugins.push(createAutoImport());
  vitePlugins.push(createSetupExtend());
  vitePlugins.push(createSvgIcon(isBuild));
  isBuild && vitePlugins.push(...createCompression(viteEnv));
  return vitePlugins;
}

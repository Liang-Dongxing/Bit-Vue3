import autoImport from 'unplugin-auto-import/vite';

export default function createAutoImport() {
  return autoImport({
    imports: [
      'vue',
      'vue-router',
      'pinia',
      {
        'vue-router': ['onBeforeRouteLeave', 'onBeforeRouteUpdate'],
      },
    ],
    dts: false,
    eslintrc: {
      enabled: true, // 默认false, true启用。生成一次就可以，避免每次工程启动都生成
      filepath: './.eslintrc-auto-import.json', // 生成json文件
      globalsPropValue: true,
    },
  });
}

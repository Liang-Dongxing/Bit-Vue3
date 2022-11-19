import { useDynamicTitle } from '@/utils/dynamicTitle';
import useAppStore from './app';
import useUserStore from './user';
import { defineStore } from 'pinia';

const maxMenuWidth = 260;
const minMenuWidth = 64;
const useSettingsStore = defineStore('settings', {
  state: () => ({
    title: '',
    theme: '#409EFF',
    //  网页标题
    appTitle: import.meta.env.VITE_APP_TITLE,
    appVersion: import.meta.env.VITE_APP_VERSION,
    //  侧边栏主题 深色主题theme-dark，浅色主题theme-light
    sideTheme: 'theme-dark',
    //  是否暗黑模式
    isDark: false,
    //  是否系统布局配置
    showSettings: false,
    //  是否显示顶部导航
    topNav: false,
    //  是否显示 tagsView
    tagsView: true,
    //  是否固定头部
    fixedHeader: false,
    //  是否显示logo
    sidebarLogo: false,
    //  是否折叠侧边栏
    sidebarCollapse: false,
    //  是否只保持一个子菜单的展开
    uniqueOpened: false,
    //  是否隐藏面包屑
    breadcrumb: false,
    //  开启水平菜单
    horizontalMenu: false,
    //  水平菜单位置
    horizontalMenuLocation: 'left',
    //  是否水平菜单独占一行
    horizontalMenuExclusive: false,
    //  是否显示动态标题
    dynamicTitle: false,
    //  菜单宽度
    menuWidth: 260,
    //  水印配置
    watermark: false,
    // 表单域标签的位置，如果值为 left 或者 right 时，则需要设置 label-width。可选值为 left、right、top
    labelPosition: 'top',
    //  水印显示内容
    watermarkContent: ['nickName'],
    watermarkText: '',
  }),
  actions: {
    // 修改布局设置
    changeSetting(data) {
      const { key, value } = data;
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = value;
      }
    },
    // 设置网页标题
    setTitle(title) {
      this.title = title;
      useDynamicTitle();
    },
    getMenuWidth() {
      return this.menuWidth + 'px';
    },
    setMenuWidth() {
      const appStore = useAppStore();
      if (appStore.shrink) {
        this.menuWidth = this.sidebarCollapse ? 0 : maxMenuWidth;
      } else {
        this.menuWidth = this.sidebarCollapse ? minMenuWidth : maxMenuWidth;
      }
    },
    toggleSidebarCollapse() {
      this.sidebarCollapse = !this.sidebarCollapse;
    },
    setSidebarCollapse(isCollapse) {
      this.sidebarCollapse = isCollapse;
    },
    getWatermarkContent() {
      let userStore = useUserStore();
      let content = [];
      this.watermarkContent.forEach((item) => {
        content.push(userStore[item]);
      });
      this.watermarkText = content.join(',');
    },
  },
  persist: {
    key: 'layout-setting',
  },
});

export default useSettingsStore;

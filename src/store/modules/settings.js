import defaultSettings from '@/settings';
import { useDynamicTitle } from '@/utils/dynamicTitle';
import useAppStore from './app';
import useUserStore from './user';

const { appTitle, appVersion, sideTheme, isDark, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, sidebarCollapse, breadcrumb, dynamicTitle, menuWidth, horizontalMenu, horizontalMenuLocation, horizontalMenuExclusive, uniqueOpened, watermark, watermarkContent } = defaultSettings;

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || '';

const maxMenuWidth = 260;
const minMenuWidth = 64;
const useSettingsStore = defineStore('settings', {
  state: () => ({
    appTitle: appTitle,
    appVersion: appVersion,
    title: '',
    theme: storageSetting.theme || '#409EFF',
    sideTheme: storageSetting.sideTheme || sideTheme,
    isDark: storageSetting.isDark || isDark,
    showSettings: showSettings,
    topNav: storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
    tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
    fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
    sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
    sidebarCollapse: storageSetting.sidebarCollapse === undefined ? sidebarCollapse : storageSetting.sidebarCollapse,
    breadcrumb: storageSetting.breadcrumb === undefined ? breadcrumb : storageSetting.breadcrumb,
    dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,
    menuWidth: storageSetting.menuWidth === undefined ? menuWidth : storageSetting.menuWidth,
    horizontalMenu: storageSetting.horizontalMenu === undefined ? horizontalMenu : storageSetting.horizontalMenu,
    horizontalMenuLocation: storageSetting.horizontalMenuLocation === undefined ? horizontalMenuLocation : storageSetting.horizontalMenuLocation,
    horizontalMenuExclusive: storageSetting.horizontalMenuExclusive === undefined ? horizontalMenuExclusive : storageSetting.horizontalMenuExclusive,
    watermark: storageSetting.watermark === undefined ? watermark : storageSetting.watermark,
    watermarkContent: storageSetting.watermarkContent === undefined ? watermarkContent : storageSetting.watermarkContent,
    watermarkText: storageSetting.watermarkText === undefined ? '' : storageSetting.watermarkText,
    uniqueOpened: storageSetting.uniqueOpened === undefined ? uniqueOpened : storageSetting.uniqueOpened,
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
});

export default useSettingsStore;

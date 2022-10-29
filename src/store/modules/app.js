import Cookies from 'js-cookie';

const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
      withoutAnimation: false,
      hide: false,
    },
    shrink: false,
    device: 'desktop',
  }),
  actions: {
    toggleSideBar(withoutAnimation) {
      if (this.sidebar.hide) {
        return false;
      }
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = withoutAnimation;
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', 1);
      } else {
        Cookies.set('sidebarStatus', 0);
      }
    },
    closeSideBar(withoutAnimation) {
      Cookies.set('sidebarStatus', 0);
      this.sidebar.opened = false;
      this.sidebar.withoutAnimation = withoutAnimation;
    },
    toggleDevice(device) {
      this.device = device;
    },
    setShrink(shrink) {
      this.shrink = shrink;
    },
    toggleSideBarHide(status) {
      this.sidebar.hide = status;
    },
    menuWidth() {
      return this.sidebar.menuWidth + 'px';
    },
  },
});

export default useAppStore;

export default {
  /**
   * 网页标题
   */
  appTitle: import.meta.env.VITE_APP_TITLE,
  appVersion: import.meta.env.VITE_APP_VERSION,
  /**
   * 侧边栏主题 深色主题theme-dark，浅色主题theme-light
   */
  sideTheme: 'theme-dark',
  /**
   * 是否暗黑模式
   */
  isDark: false,
  /**
   * 是否系统布局配置
   */
  showSettings: false,

  /**
   * 是否显示顶部导航
   */
  topNav: false,

  /**
   * 是否显示 tagsView
   */
  tagsView: true,

  /**
   * 是否固定头部
   */
  fixedHeader: false,

  /**
   * 是否显示logo
   */
  sidebarLogo: false,
  /**
   * 是否折叠侧边栏
   */
  sidebarCollapse: false,
  /**
   * 是否只保持一个子菜单的展开
   */
  uniqueOpened: false,
  /**
   * 是否隐藏面包屑
   */
  breadcrumb: false,

  /**
   * 开启水平菜单
   */
  horizontalMenu: false,
  /**
   * 水平菜单位置
   */
  horizontalMenuLocation: 'left',
  /**
   * 是否水平菜单独占一行
   */
  horizontalMenuExclusive: false,

  /**
   * 是否显示动态标题
   */
  dynamicTitle: false,
  /**
   * 菜单宽度
   */
  menuWidth: 260,
  /**
   * 水印配置
   */
  watermark: false,
  /**
   * 水印显示内容
   */
  watermarkContent: ['nickName'],

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',
};

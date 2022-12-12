import useLanguageStore from '@/store/modules/language';
import { createI18n } from '@vue-i18n';
import globsEN from './globs-en';
import globsZH from './globs-zh-cn';

/*
 * 默认只引入 element-plus 的中英文语言包
 * 其他语言包请自行在此 import,并添加到 assignLocale 内
 * 动态 import 只支持相对路径，所以无法按需 import element-plus 的语言包
 * 但i18n的 messages 内是按需载入的
 */
import elementZhcnLocale from 'element-plus/lib/locale/lang/zh-cn';
import elementEnLocale from 'element-plus/lib/locale/lang/en';

export let i18n = null;

const assignLocale = {
  'zh-cn': [elementZhcnLocale],
  en: [elementEnLocale],
};

export function loadLang(app) {
  const config = useLanguageStore();
  const locale = config.defaultLang;

  // 加载框架语言包
  let message = {};
  switch (locale) {
    case 'zh-cn':
      message = globsZH;
      break;
    case 'en':
      message = globsEN;
      break;
  }

  const messages = {
    [locale]: {
      ...message,
    },
  };

  // 合并语言包(含element-puls、页面语言包)
  Object.assign(messages[locale], ...assignLocale[locale]);

  i18n = createI18n({
    locale: locale,
    legacy: false, // 组合式api
    globalInjection: true, // 挂载$t,$d等到全局
    fallbackLocale: config.fallbackLang,
    messages,
  });

  app.use(i18n);
  return i18n;
}

export function editDefaultLang(lang) {
  useLanguageStore().setLanguage(lang);
  /*
   * 语言包是按需加载的,比如默认语言为中文,则只在app实例内加载了中文语言包
   * 查阅文档无数遍,无耐接受当前的 i18n 版本并不支持动态添加语言包(或需要在 setup 内动态添加,无法满足全局替换的需求)
   * 故 reload;如果您有已经实现的无需一次性加载全部语言包且无需 reload 的方案,请一定@我
   */
  window.location.reload();
}

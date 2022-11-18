import { defineStore } from 'pinia';

const useLanguageStore = defineStore('language', {
  state: () => ({
    // 默认语言，可选值<zh-cn|en>
    defaultLang: 'zh-cn',
    // 当在默认语言包找不到翻译时，继续在 fallbackLang 语言包内查找翻译
    fallbackLang: 'zh-cn',
    // 支持的语言列表
    langArray: [
      { name: '中文简体', value: 'zh-cn' },
      { name: '英文', value: 'en' },
    ],
  }),
  actions: {
    setLanguage(lang) {
      this.defaultLang = lang;
    },
  },
  persist: {
    key: 'language-setting',
  },
});

export default useLanguageStore;

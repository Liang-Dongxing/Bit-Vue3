module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-strongly-recommended', '@vue/eslint-config-prettier', './.eslintrc-auto-import.json'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    'prettier/prettier': ['error'],
    'vue/multi-word-component-names': 'off',
    /**
     "off" 或 0 - 关闭规则
     "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
     "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
     */
  },
};

import { createApp } from 'vue';

import ElementPlus from 'element-plus';

import '@/assets/styles/index.scss'; // global css

import App from './App';
import store from './store';
import router from './router';

import components from './components'; // components
import directive from './directive'; // directive

import { loadLang } from '@/language';

// svg图标
import 'virtual:svg-icons-register';

const app = createApp(App);

app.use(router);
app.use(store);

components(app);
directive(app);

// 全局语言包加载
const i18n = await loadLang(app);
app.use(ElementPlus, { i18n: i18n.global.t });

app.mount('#app');

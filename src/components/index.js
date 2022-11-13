// 分页组件
import Pagination from '@/components/Pagination';
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar';
// 文件上传组件
import FileUpload from '@/components/FileUpload';
// 图片上传组件
import ImageUpload from '@/components/ImageUpload';
// 图片预览组件
import ImagePreview from '@/components/ImagePreview';
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect';
// 字典标签组件
import DictTag from '@/components/DictTag';
import SvgIcon from '@/components/SvgIcon';
import { IconPark } from '@icon-park/vue-next/es/all';
import VueECharts from 'vue-echarts';
import * as components from '@element-plus/icons-vue';
import { useDict } from '@/utils/dict';
import { download } from '@/utils/request';
import { addDateRange, handleTree, parseTime, resetForm, selectDictLabel, selectDictLabels } from '@/utils/bit';
import * as echarts from 'echarts';

// 注册指令
import tab from '@/plugins/tab';
import auth from '@/plugins/auth';
import cache from '@/plugins/cache';
import modal from '@/plugins/modal';

// 动画库
import * as VueKinesis from 'vue-kinesis';

export default function component(app) {
  // 全局方法挂载
  app.config.globalProperties.useDict = useDict;
  app.config.globalProperties.download = download;
  app.config.globalProperties.parseTime = parseTime;
  app.config.globalProperties.resetForm = resetForm;
  app.config.globalProperties.handleTree = handleTree;
  app.config.globalProperties.addDateRange = addDateRange;
  app.config.globalProperties.selectDictLabel = selectDictLabel;
  app.config.globalProperties.selectDictLabels = selectDictLabels;
  app.config.globalProperties.$echarts = echarts;
  // 页签操作
  app.config.globalProperties.$tab = tab;
  // 认证对象
  app.config.globalProperties.$auth = auth;
  // 缓存对象
  app.config.globalProperties.$cache = cache;
  // 模态框对象
  app.config.globalProperties.$modal = modal;
  // 下载文件
  app.config.globalProperties.$download = download;

  // 全局组件挂载
  app.component('DictTag', DictTag);
  app.component('Pagination', Pagination);
  app.component('TreeSelect', TreeSelect);
  app.component('FileUpload', FileUpload);
  app.component('ImageUpload', ImageUpload);
  app.component('ImagePreview', ImagePreview);
  app.component('RightToolbar', RightToolbar);
  app.component('SvgIcon', SvgIcon);
  app.component('IconPark', IconPark);
  app.component('VChart', VueECharts);
  for (const key in components) {
    const componentConfig = components[key];
    app.component(componentConfig.name, componentConfig);
  }
  for (const key in VueKinesis) {
    const componentConfig = VueKinesis[key];
    app.component(componentConfig.name, componentConfig);
  }
}

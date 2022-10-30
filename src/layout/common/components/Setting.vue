<template>
  <el-drawer v-model="showSettings" direction="rtl" :with-header="false" size="300px">
    <template #header>
      <h3>布局配置</h3>
    </template>
    <template #default>
      <el-scrollbar>
        <el-form>
          <el-divider border-style="dashed">全局</el-divider>
          <el-form-item label="暗黑模式">
            <DarkSwitch
              @click="
                toggleDark();
                handleTheme();
              " />
          </el-form-item>
          <el-form-item label="主题颜色">
            <el-color-picker v-model="theme" :predefine="predefineColors" @change="themeChange" />
          </el-form-item>
          <el-form-item label="显示水印">
            <el-switch v-model="watermark" />
          </el-form-item>
          <el-form-item label="显示水印内容">
            <el-checkbox-group v-model="watermarkContent">
              <el-checkbox label="name">用户名</el-checkbox>
              <el-checkbox label="nickName">昵称</el-checkbox>
              <el-checkbox label="deptName">部门</el-checkbox>
              <el-checkbox label="phonenumber">手机</el-checkbox>
              <el-checkbox label="email">邮箱</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-divider border-style="dashed">系统布局配置</el-divider>
          <el-form-item label="隐藏面包屑">
            <el-switch v-model="breadcrumb" />
          </el-form-item>
          <el-form-item label="显示动态标题">
            <el-switch v-model="dynamicTitle" />
          </el-form-item>
          <el-form-item label="隐藏LOGO">
            <el-switch v-model="sidebarLogo" />
          </el-form-item>
          <el-divider border-style="dashed">侧边菜单</el-divider>
          <el-form-item label="侧边菜单开启">
            <el-switch v-model="verticalMenu" />
          </el-form-item>
          <el-form-item label="侧边菜单宽度（px）">
            <el-input-number v-model="menuWidth" :step="1" :min="230" :max="400" />
          </el-form-item>
          <el-form-item label="是否只展开一个子菜单">
            <el-switch v-model="uniqueOpened" />
          </el-form-item>
          <el-form-item label="侧边菜单折叠">
            <el-switch v-model="sidebarCollapse" />
          </el-form-item>
          <el-divider border-style="dashed">顶部菜单</el-divider>
          <el-form-item label="顶部菜单">
            <el-switch v-model="horizontalMenu" />
          </el-form-item>
          <el-form-item label="顶部菜单独占一行">
            <el-switch v-model="horizontalMenuExclusive" />
          </el-form-item>
          <el-form-item label="顶部菜单">
            <el-radio-group v-model="horizontalMenuLocation">
              <el-radio-button label="left">左</el-radio-button>
              <el-radio-button label="center">中</el-radio-button>
              <el-radio-button label="right">右</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </template>
    <template #footer>
      <el-button icon="Refresh" type="primary" @click="resetSetting">恢复默认</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings';
import DarkSwitch from '@/layout/common/components/DarkSwitch';
import { isDark, toggleDark } from '@/utils/dark';
import { handleThemeStyle } from '@/utils/theme';
import { useDynamicTitle } from '@/utils/dynamicTitle';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const theme = ref(settingsStore.theme);
const storeSettings = computed(() => settingsStore);

const showSettings = ref(false);
const predefineColors = ref(['#409EFF', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585']);

/**是否需要侧边栏的logo */
const sidebarLogo = computed({
  get: () => storeSettings.value.sidebarLogo,
  set: (val) => {
    settingsStore.changeSetting({ key: 'sidebarLogo', value: val });
    saveSetting();
  },
});
/**是否需要水印 */
const watermark = computed({
  get: () => storeSettings.value.watermark,
  set: (val) => {
    settingsStore.changeSetting({ key: 'watermark', value: val });
    settingsStore.getWatermarkContent();
    saveSetting();
  },
});
/**水印内容 */
const watermarkContent = computed({
  get: () => storeSettings.value.watermarkContent,
  set: (val) => {
    settingsStore.changeSetting({ key: 'watermarkContent', value: val });
    settingsStore.getWatermarkContent();
    saveSetting();
  },
});
/**是否需要折叠侧边栏 */
const sidebarCollapse = computed({
  get: () => storeSettings.value.sidebarCollapse,
  set: (val) => {
    settingsStore.changeSetting({ key: 'sidebarCollapse', value: val });
    settingsStore.setMenuWidth();
    saveSetting();
  },
});
/**是否需要侧边栏的动态网页的title */
const dynamicTitle = computed({
  get: () => storeSettings.value.dynamicTitle,
  set: (val) => {
    settingsStore.changeSetting({ key: 'dynamicTitle', value: val });
    // 动态设置网页标题
    useDynamicTitle();
    saveSetting();
  },
});

/**是否需要隐藏面包屑 */
const breadcrumb = computed({
  get: () => storeSettings.value.breadcrumb,
  set: (val) => {
    settingsStore.changeSetting({ key: 'breadcrumb', value: val });
    saveSetting();
  },
});
/**是否开启垂直菜单 */
const verticalMenu = computed({
  get: () => !storeSettings.value.horizontalMenu,
  set: (val) => {
    settingsStore.changeSetting({ key: 'horizontalMenu', value: !val });
    settingsStore.changeSetting({ key: 'horizontalMenuExclusive', value: false });
    saveSetting();
  },
});
/**是否开启垂直菜单 */
const menuWidth = computed({
  get: () => storeSettings.value.menuWidth,
  set: (val) => {
    settingsStore.changeSetting({ key: 'menuWidth', value: val });
    saveSetting();
  },
});
/**是否开启水平菜单 */
const horizontalMenu = computed({
  get: () => storeSettings.value.horizontalMenu,
  set: (val) => {
    settingsStore.changeSetting({ key: 'horizontalMenu', value: val });
    saveSetting();
  },
});
/**水平菜单对齐位置 */
const horizontalMenuLocation = computed({
  get: () => storeSettings.value.horizontalMenuLocation,
  set: (val) => {
    settingsStore.changeSetting({ key: 'horizontalMenuLocation', value: val });
    saveSetting();
  },
});
/**是否开启水平菜单独占一行 */
const horizontalMenuExclusive = computed({
  get: () => storeSettings.value.horizontalMenuExclusive,
  set: (val) => {
    settingsStore.changeSetting({ key: 'horizontalMenuExclusive', value: val });
    saveSetting();
  },
});
/**是否只展开一个子菜单 */
const uniqueOpened = computed({
  get: () => storeSettings.value.uniqueOpened,
  set: (val) => {
    settingsStore.changeSetting({ key: 'uniqueOpened', value: val });
    saveSetting();
  },
});

const handleTheme = () => {
  settingsStore.changeSetting({ key: 'isDark', value: isDark.value });
  handleThemeStyle(theme.value, isDark.value);
  saveSetting();
};

const themeChange = (val) => {
  settingsStore.changeSetting({ key: 'theme', value: val });
  theme.value = val;
  handleThemeStyle(val, isDark.value);
  saveSetting();
};

const saveSetting = () => {
  // proxy.$modal.loading('正在保存到本地，请稍候...');
  let layoutSetting = {
    topNav: storeSettings.value.topNav,
    tagsView: storeSettings.value.tagsView,
    fixedHeader: storeSettings.value.fixedHeader,
    sidebarLogo: storeSettings.value.sidebarLogo,
    dynamicTitle: storeSettings.value.dynamicTitle,
    sideTheme: storeSettings.value.sideTheme,
    isDark: storeSettings.value.isDark,
    theme: storeSettings.value.theme,
    breadcrumb: storeSettings.value.breadcrumb,
    horizontalMenu: storeSettings.value.horizontalMenu,
    horizontalMenuLocation: storeSettings.value.horizontalMenuLocation,
    horizontalMenuExclusive: storeSettings.value.horizontalMenuExclusive,
    menuWidth: storeSettings.value.menuWidth,
    watermark: storeSettings.value.watermark,
    watermarkContent: storeSettings.value.watermarkContent,
    watermarkText: storeSettings.value.watermarkText,
    isUniqueOpened: storeSettings.value.isUniqueOpened,
  };
  localStorage.setItem('layout-setting', JSON.stringify(layoutSetting));
  // setTimeout(proxy.$modal.closeLoading(), 1000);
};

const resetSetting = () => {
  proxy.$modal.loading('正在清除设置缓存并刷新，请稍候...');
  localStorage.removeItem('layout-setting');
  setTimeout('window.location.reload()', 1000);
};

const openSetting = () => {
  showSettings.value = true;
};

defineExpose({
  openSetting,
});
</script>

<style lang="scss" scoped>
:deep(.el-overlay){
  .el-drawer{

    :deep(.el-drawer__header) {
      margin-bottom: 0;
    }
  }
}

.el-button.el-button--primary {
  width: 100%;
}
</style>

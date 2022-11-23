<template>
  <el-drawer v-model="showSettings" direction="rtl" :with-header="false" size="500px">
    <template #header>
      <h3>{{ $t('om.setting.conf1') }}</h3>
    </template>
    <template #default>
      <el-scrollbar>
        <el-form>
          <el-divider border-style="dashed">{{ $t('om.setting.conf2') }}</el-divider>
          <el-form-item :label="$t('om.setting.conf3')">
            <DarkSwitch
              @click="
                toggleDark();
                handleTheme();
              " />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf4')">
            <el-color-picker v-model="theme" :predefine="predefineColors" @change="themeChange" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf5')">
            <el-select v-model="language" @change="editDefaultLang">
              <el-option v-for="item in languageArray" :key="item" :label="item.name" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf24')">
            <el-select v-model="labelPosition">
              <el-option label="上" value="top" />
              <el-option label="左" value="left" />
              <el-option label="右" value="right" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf6')">
            <el-switch v-model="watermark" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf7')">
            <el-checkbox-group v-model="watermarkContent">
              <el-checkbox label="name">{{ $t('om.user.name') }}</el-checkbox>
              <el-checkbox label="nickName">{{ $t('om.user.nickname') }}</el-checkbox>
              <el-checkbox label="deptName">{{ $t('om.user.department') }}</el-checkbox>
              <el-checkbox label="phonenumber">{{ $t('om.user.mobile_phone_number') }}</el-checkbox>
              <el-checkbox label="email">{{ $t('om.user.email') }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-divider border-style="dashed">{{ $t('om.setting.conf8') }}</el-divider>
          <el-form-item :label="$t('om.setting.conf9')">
            <el-switch v-model="breadcrumb" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf10')">
            <el-switch v-model="dynamicTitle" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf11')">
            <el-switch v-model="sidebarLogo" />
          </el-form-item>
          <el-divider border-style="dashed">{{ $t('om.setting.conf12') }}</el-divider>
          <el-form-item :label="$t('om.setting.conf13')">
            <el-switch v-model="verticalMenu" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf14')">
            <el-input-number v-model="menuWidth" :step="1" :min="230" :max="400" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf15')">
            <el-switch v-model="uniqueOpened" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf16')">
            <el-switch v-model="sidebarCollapse" />
          </el-form-item>
          <el-divider border-style="dashed">{{ $t('om.setting.conf17') }}</el-divider>
          <el-form-item :label="$t('om.setting.conf17')">
            <el-switch v-model="horizontalMenu" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf18')">
            <el-switch v-model="horizontalMenuExclusive" />
          </el-form-item>
          <el-form-item :label="$t('om.setting.conf19')">
            <el-radio-group v-model="horizontalMenuLocation">
              <el-radio-button label="left">{{ $t('om.setting.conf20') }}</el-radio-button>
              <el-radio-button label="center">{{ $t('om.setting.conf21') }}</el-radio-button>
              <el-radio-button label="right">{{ $t('om.setting.conf22') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </template>
    <template #footer>
      <el-button icon="Refresh" type="primary" @click="resetSetting">{{ $t('om.setting.conf23') }}</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings';
import useLanguageStore from '@/store/modules/language';
import DarkSwitch from '@/layout/common/components/DarkSwitch';
import { editDefaultLang } from '@/language';
import { isDark, toggleDark } from '@/utils/dark';
import { handleThemeStyle } from '@/utils/theme';
import { useDynamicTitle } from '@/utils/dynamicTitle';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const languageStore = useLanguageStore();

const theme = ref(settingsStore.theme);
const language = ref(languageStore.defaultLang);
const languageArray = ref(languageStore.langArray);
const storeSettings = computed(() => settingsStore);

const showSettings = ref(false);
const predefineColors = ref(['#409EFF', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585']);

/**是否需要侧边栏的logo */
const sidebarLogo = computed({
  get: () => storeSettings.value.sidebarLogo,
  set: (val) => {
    settingsStore.changeSetting({ key: 'sidebarLogo', value: val });
  },
});
/**是否需要水印 */
const watermark = computed({
  get: () => storeSettings.value.watermark,
  set: (val) => {
    settingsStore.changeSetting({ key: 'watermark', value: val });
    settingsStore.getWatermarkContent();
  },
});
/**水印内容 */
const watermarkContent = computed({
  get: () => storeSettings.value.watermarkContent,
  set: (val) => {
    settingsStore.changeSetting({ key: 'watermarkContent', value: val });
    settingsStore.getWatermarkContent();
  },
});
/**是否需要折叠侧边栏 */
const sidebarCollapse = computed({
  get: () => storeSettings.value.sidebarCollapse,
  set: (val) => {
    settingsStore.changeSetting({ key: 'sidebarCollapse', value: val });
    settingsStore.setMenuWidth();
  },
});
/**是否需要侧边栏的动态网页的title */
const dynamicTitle = computed({
  get: () => storeSettings.value.dynamicTitle,
  set: (val) => {
    settingsStore.changeSetting({ key: 'dynamicTitle', value: val });
    // 动态设置网页标题
    useDynamicTitle();
  },
});

/**是否需要隐藏面包屑 */
const breadcrumb = computed({
  get: () => storeSettings.value.breadcrumb,
  set: (val) => {
    settingsStore.changeSetting({ key: 'breadcrumb', value: val });
  },
});
/**是否开启垂直菜单 */
const verticalMenu = computed({
  get: () => !storeSettings.value.horizontalMenu,
  set: (val) => {
    settingsStore.changeSetting({ key: 'horizontalMenu', value: !val });
    settingsStore.changeSetting({ key: 'horizontalMenuExclusive', value: false });
  },
});
/**是否开启垂直菜单 */
const menuWidth = computed({
  get: () => storeSettings.value.menuWidth,
  set: (val) => {
    settingsStore.changeSetting({ key: 'menuWidth', value: val });
  },
});
/**是否开启水平菜单 */
const horizontalMenu = computed({
  get: () => storeSettings.value.horizontalMenu,
  set: (val) => {
    settingsStore.changeSetting({ key: 'horizontalMenu', value: val });
  },
});
/**水平菜单对齐位置 */
const horizontalMenuLocation = computed({
  get: () => storeSettings.value.horizontalMenuLocation,
  set: (val) => {
    settingsStore.changeSetting({ key: 'horizontalMenuLocation', value: val });
  },
});
/**是否开启水平菜单独占一行 */
const horizontalMenuExclusive = computed({
  get: () => storeSettings.value.horizontalMenuExclusive,
  set: (val) => {
    settingsStore.changeSetting({ key: 'horizontalMenuExclusive', value: val });
  },
});
/**是否只展开一个子菜单 */
const uniqueOpened = computed({
  get: () => storeSettings.value.uniqueOpened,
  set: (val) => {
    settingsStore.changeSetting({ key: 'uniqueOpened', value: val });
  },
});

const handleTheme = () => {
  settingsStore.changeSetting({ key: 'isDark', value: isDark.value });
  handleThemeStyle(theme.value, isDark.value);
};

const themeChange = (val) => {
  settingsStore.changeSetting({ key: 'theme', value: val });
  theme.value = val;
  handleThemeStyle(val, isDark.value);
};
/**切换表单域标签的位置 */
const labelPosition = computed({
  get: () => storeSettings.value.labelPosition,
  set: (val) => {
    settingsStore.changeSetting({ key: 'labelPosition', value: val });
  },
});
const resetSetting = () => {
  proxy.$modal.loading(proxy.$t('om.setting.msg1'));
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
:deep(.el-overlay) {
  .el-drawer {
    :deep(.el-drawer__header) {
      margin-bottom: 0;
    }
  }
}

.el-button.el-button--primary {
  width: 100%;
}
</style>

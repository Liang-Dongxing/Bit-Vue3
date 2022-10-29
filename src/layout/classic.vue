<template>
  <el-container style="height: 100%">
    <el-drawer v-model="isDrawer" custom-class="drawer-menu" v-if="appStore.shrink" direction="ltr" :with-header="false" :show-close="false" :size="menuWidth" @close="toggleSideBar">
      <menu-vertical :collapse="isCollapse" />
    </el-drawer>
    <el-aside v-if="!appStore.shrink && !isHorizontalMenu">
      <menu-vertical :collapse="isCollapse" />
    </el-aside>
    <el-container>
      <el-header :class="isHorizontalMenuExclusive ? 'el-header-exclusive' : ''">
        <menu-horizontal v-if="isHorizontalMenu && !isHorizontalMenuExclusive" @openSetting="openSetting" />
        <menu-horizontal-exclusive v-if="isHorizontalMenu && isHorizontalMenuExclusive" @openSetting="openSetting" />
        <ClassicHeader v-if="!isHorizontalMenu" :collapse="isCollapse" @openSetting="openSetting" />
      </el-header>
      <el-main>
        <Main />
      </el-main>
    </el-container>
    <Setting ref="SettingRef" />
  </el-container>
</template>

<script setup>
import MenuVertical from '@/layout/backend/components/MenuVertical';
import MenuHorizontal from '@/layout/backend/components/MenuHorizontal';
import Main from '@/layout/common/components/Main';
import ClassicHeader from '@/layout/common/components/ClassicHeader';
import useSettingsStore from '@/store/modules/settings';
import useAppStore from '@/store/modules/app';
import Setting from '@/layout/common/components/Setting';
import MenuHorizontalExclusive from '@/layout/backend/components/MenuHorizontalExclusive';

const settingsStore = useSettingsStore();
const appStore = useAppStore();

const storeSettings = computed(() => settingsStore);
const isCollapse = computed(() => storeSettings.value.sidebarCollapse);
const isDrawer = computed(() => !storeSettings.value.sidebarCollapse);
const isHorizontalMenu = computed(() => storeSettings.value.horizontalMenu);
const isHorizontalMenuExclusive = computed(() => storeSettings.value.horizontalMenuExclusive);
const menuWidth = computed(() => settingsStore.getMenuWidth());

function toggleSideBar() {
  if (!isCollapse.value) {
    settingsStore.toggleSidebarCollapse();
    settingsStore.setMenuWidth();
  }
}

const SettingRef = ref(null);

function openSetting() {
  SettingRef.value.openSetting();
}
</script>
<style lang="scss" scoped>
.el-container {
  .el-header {
    padding: 0;
    display: flex;
    justify-content: space-between;
    height: 50px;
  }
  .el-header-exclusive {
    height: 120px;
    flex-direction: column;
  }

  .el-aside {
    overflow: hidden;
    transition: width 0.3s ease;
    width: v-bind(menuWidth);
    border-right: solid 1px var(--el-menu-border-color);
    background-color: var(--el-menu-bg-color);
  }

  .el-main {
    padding: 0;
    background-color: var(--el-bg-color-page);
  }

  .shrink {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999999;
  }

  :deep(.el-overlay) {
    .drawer-menu {
      .el-drawer__body {
        padding: 0;
        overflow: hidden;
      }
    }
  }
}
</style>

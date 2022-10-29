<template>
  <div :class="showLogo ? 'exclusive' : 'exclusive-left'">
    <logo v-if="showLogo" :collapse="false" :icon="false" />
    <NavAvatar @openSetting="openSetting" />
  </div>
  <el-scrollbar>
    <el-menu :default-active="activeMenu" mode="horizontal" :collapse-transition="false" :router="true" :class="'menu-location-' + menuLocation">
      <menu-tree :menus="sidebarRouters" />
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import MenuTree from '@/layout/backend/components/MenuTree';
import Logo from '@/layout/common/components/Logo';
import usePermissionStore from '@/store/modules/permission';
import useSettingsStore from '@/store/modules/settings';
import NavAvatar from '@/layout/common/components/NavAvatar';

const route = useRoute();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter((item) => !item.hidden));
const showLogo = computed(() => !settingsStore.sidebarLogo);
const menuLocation = computed(() => settingsStore.horizontalMenuLocation);

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});

const emits = defineEmits(['openSetting']);

function openSetting() {
  emits('openSetting');
}
</script>

<style lang="scss" scoped>
.exclusive {
  display: flex;
  justify-content: space-between;
}

.exclusive-left {
  display: flex;
  justify-content: flex-end;
}

.el-scrollbar {
  .el-menu {
    border-bottom: unset;
  }

  .menu-location-left {
    justify-content: flex-start;
  }

  .menu-location-center {
    justify-content: center;
  }

  .menu-location-right {
    justify-content: flex-end;
  }
}
</style>

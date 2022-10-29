<template>
  <logo ref="logoRef" v-if="showLogo" :collapse="false" :icon="false" />
  <el-scrollbar>
    <el-menu :default-active="activeMenu" mode="horizontal" :collapse-transition="false" :router="true" :class="'menu-location-' + menuLocation">
      <menu-tree :menus="sidebarRouters" />
    </el-menu>
  </el-scrollbar>
  <NavAvatar ref="NavAvatarRef" @openSetting="openSetting" />
</template>

<script setup>
import MenuTree from '@/layout/backend/components/MenuTree';
import Logo from '@/layout/common/components/Logo';
import usePermissionStore from '@/store/modules/permission';
import useSettingsStore from '@/store/modules/settings';
import NavAvatar from '@/layout/common/components/NavAvatar';

const { proxy } = getCurrentInstance();
const route = useRoute();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

const menuWidth = ref('100%');
const logoRef = ref(null);
const NavAvatarRef = ref(null);
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

onMounted(() => {
  // 计算菜单高度
  CalculateMenuWidth();

  // 窗口改变时，重新计算菜单高度
  window.addEventListener('resize', () => {
    console.log('水平菜单重新绘制');
    CalculateMenuWidth();
  });
});
const CalculateMenuWidth = () => {
  let temp = proxy.$parent.$el.clientWidth - (logoRef.value ? logoRef.value.$el.clientHeight : 0) - NavAvatarRef.value.$el.clientHeight + 'px';
  if (menuWidth.value !== temp) {
    menuWidth.value = temp;
    // proxy.$forceUpdate();
  }
};
const emits = defineEmits(['openSetting']);

function openSetting() {
  emits('openSetting');
}
</script>

<style lang="scss" scoped>
.el-scrollbar {
  width: v-bind(menuWidth);

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

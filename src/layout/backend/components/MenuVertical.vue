<template>
  <logo ref="logoRef" v-if="showLogo" :collapse="props.collapse" :icon="true" />
  <el-scrollbar>
    <el-menu :default-active="activeMenu" :collapse="props.collapse" :unique-opened="isUniqueOpened" :collapse-transition="false" :router="true">
      <menu-tree :menus="sidebarRouters" />
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import MenuTree from '@/layout/backend/components/MenuTree';
import Logo from '@/layout/common/components/Logo';
import usePermissionStore from '@/store/modules/permission';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const route = useRoute();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

const logoRef = ref(null);
const menuHeight = ref('100%');

const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter((item) => !item.hidden));
const showLogo = computed(() => !settingsStore.sidebarLogo);
const isUniqueOpened = computed(() => settingsStore.uniqueOpened);

const props = defineProps({
  // route object
  collapse: {
    type: Boolean,
    required: true,
  },
});

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
  CalculateMenuHeight();

  // 窗口改变时，重新计算菜单高度
  window.addEventListener('resize', () => {
    console.log('垂直菜单重新绘制');
    CalculateMenuHeight();
  });
});
const CalculateMenuHeight = () => {
  let temp = document.documentElement.clientHeight - (logoRef.value ? logoRef.value.$el.clientHeight : 0) + 'px';
  if (menuHeight.value !== temp) {
    menuHeight.value = temp;
    proxy.$forceUpdate();
  }
};
</script>

<style lang="scss" scoped>
.layout-logo {
  background-color: var(--el-fill-color-extra-light);
}
.el-scrollbar {
  height: v-bind(menuHeight);

  .el-menu {
    border: unset;
    user-select: none;
  }
}
</style>

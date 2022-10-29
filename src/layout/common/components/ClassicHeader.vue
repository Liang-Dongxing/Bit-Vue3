<template>
  <div class="layout-nav-tabs" :class="appStore.shrink ? 'layout-nav-tabs-unfold' : ''">
    <el-icon :size="22" v-if="appStore.shrink" @click="toggleSideBar" class="unfold">
      <icon-park type="menu-unfold-one" theme="filled" />
    </el-icon>
    <NavTabs v-if="!appStore.shrink" />
  </div>
  <NavAvatar ref="NavAvatarRef" @openSetting="openSetting" />
</template>

<script setup>
import NavTabs from '@/layout/common/components/NavTabs';
import NavAvatar from '@/layout/common/components/NavAvatar';
import useAppStore from '@/store/modules/app';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const NavAvatarRef = ref(null);
let NavTabsWidth = ref('0px');

const props = defineProps({
  // route object
  collapse: {
    type: Boolean,
    required: true,
  },
});

onMounted(() => {
  CalculateNavTabsWidth();

  // 窗口改变时，重新计算NavTabs的宽度

  window.addEventListener('resize', () => {
    console.log('重新计算NavTabs的宽度');
    CalculateNavTabsWidth();
  });
});
watch(
  () => props.collapse,
  () => {
    setTimeout(() => {
      // 由于菜单收缩动画需要时间，所以延迟计算
      CalculateNavTabsWidth();
    }, 400);
  },
);

const CalculateNavTabsWidth = () => {
  let temp = proxy.$parent.$el.clientWidth - NavAvatarRef.value.$el.clientWidth + 'px';
  if (NavTabsWidth.value !== temp) {
    NavTabsWidth.value = temp;
    proxy.$forceUpdate();
  }
};

function toggleSideBar() {
  settingsStore.toggleSidebarCollapse();
  settingsStore.setMenuWidth();
}

const emits = defineEmits(['openSetting']);
function openSetting() {
  emits('openSetting');
}
</script>

<style lang="scss" scoped>
.layout-nav-tabs {
  transition: width 0.3s ease;
  width: v-bind(NavTabsWidth);

  .unfold {
    padding-left: 16px;
    cursor: pointer;
  }
}
.layout-nav-tabs-unfold {
  display: flex;
  align-items: center;
}
</style>

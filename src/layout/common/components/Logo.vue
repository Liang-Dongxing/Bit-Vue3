<template>
  <div class="layout-logo" :class="props.collapse ? 'layout-logo-center' : ''">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <el-link :underline="false" href="/" v-show="!props.collapse">
        <img v-if="logo" :src="logo" class="logo-img" :alt="appTitle" />
        <div class="website-name">{{ appTitle }}</div>
      </el-link>
    </transition>
    <el-icon :size="22" @click="toggleSideBar" v-if="props.icon">
      <icon-park v-show="!props.collapse" type="menu-fold-one" theme="filled" />
      <icon-park v-show="props.collapse" type="menu-unfold-one" theme="filled" />
    </el-icon>
  </div>
</template>

<script setup>
import logo from '@/assets/logo/logo.png';
import useSettingsStore from '@/store/modules/settings';

const appTitle = useSettingsStore().appTitle;
const settingsStore = useSettingsStore();

const props = defineProps({
  // route object
  collapse: {
    type: Boolean,
    required: true,
  },
  icon: {
    type: Boolean,
    required: true,
  },
});

function toggleSideBar() {
  settingsStore.toggleSidebarCollapse();
  settingsStore.setMenuWidth();
}
</script>

<style lang="scss" scoped>
.layout-logo {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  height: 50px;

  .el-link:hover {
    color: unset;
  }

  .el-icon {
    align-items: unset;
    cursor: pointer;
  }

  .logo-img {
    width: 30px;
  }

  .website-name {
    padding-left: 4px;
    font-size: var(--el-font-size-extra-large);
    font-weight: 600;
    white-space: nowrap;
  }
}

.layout-logo-center {
  justify-content: center;
}
</style>

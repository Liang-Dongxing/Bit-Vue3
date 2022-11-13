<template>
  <div class="layout-nav-right">
    <el-dropdown @command="dropdownHandleCommand">
      <span class="layout-avatar">
        <el-avatar :size="30" :src="userStore.avatar" @error="errorHandler">
          <icon-park v-if="userStore.sex === '0'" size="24" type="avatar" theme="filled" />
          <icon-park v-if="userStore.sex === '1'" size="24" type="women" theme="filled" />
          <icon-park v-if="userStore.sex === '2'" size="24" type="people" theme="filled" />
        </el-avatar>
        <span class="username">{{ userStore.nickName }}</span>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <router-link to="/user/profile" class="router-link">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided command="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-button link class="hvr-icon-push" :class="isFullscreen ? 'active' : ''" @click="toggle">
      <icon-park size="24" v-show="!isFullscreen" type="full-screen" theme="filled" class="hvr-icon" />
      <icon-park size="24" v-show="isFullscreen" type="off-screen" theme="filled" class="hvr-icon" />
    </el-button>
    <el-button link class="hvr-icon-push" @click="openSetting">
      <icon-park size="24" type="page" theme="filled" class="hvr-icon" />
    </el-button>
  </div>
</template>

<script setup>
import useUserStore from '@/store/modules/user';
import { ElMessageBox } from 'element-plus';
import useSettingsStore from '@/store/modules/settings';
import useAppStore from '@/store/modules/app';
import { useFullscreen } from '@vueuse/core';

const { isFullscreen, enter, exit, toggle } = useFullscreen();

const userStore = useUserStore();
const settingsStore = useSettingsStore();
const appStore = useAppStore();

onMounted(() => {});
onBeforeMount(() => {
  onAdaptiveLayout();
  window.addEventListener('resize', onAdaptiveLayout);
});
onUnmounted(() => {
  window.removeEventListener('resize', onAdaptiveLayout);
});
const onAdaptiveLayout = () => {
  if (document.body.clientWidth < 1024) {
    console.log('分辨率小于1024，关闭侧边栏');
    appStore.setShrink(true);
    settingsStore.setSidebarCollapse(true);
    settingsStore.setMenuWidth();
  } else {
    appStore.setShrink(false);
    settingsStore.setSidebarCollapse(false);
    settingsStore.setMenuWidth();
  }
};

function dropdownHandleCommand(command) {
  switch (command) {
    case 'openSetting':
      openSetting();
      break;
    case 'logout':
      logout();
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      userStore.logOut().then(() => {
        location.href = '/index';
      });
    })
    .catch(() => {});
}

const errorHandler = () => true;

const emits = defineEmits(['openSetting']);

function openSetting() {
  emits('openSetting');
}
</script>

<style lang="scss" scoped>
.layout-nav-right {
  display: flex;
  align-items: center;
  margin: 0 20px;

  .el-dropdown {
    height: 60px;

    .layout-avatar {
      display: flex;
      align-items: center;
      cursor: pointer;

      .el-avatar {
        margin-right: 5px;
      }

      .username {
        white-space: nowrap;
      }
    }
  }

  > .el-button,
  > .el-dropdown {
    padding: 0 7px;
    height: 60px;
  }

  .el-button.active {
    background-color: var(--el-bg-color-page);
  }

  .el-button:hover,
  .el-dropdown:hover {
    background-color: var(--el-bg-color-page);
  }

  .el-button + .el-button {
    margin-left: 0;
  }
}
</style>

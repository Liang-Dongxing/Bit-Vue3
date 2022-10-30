<template>
  <transition name="el-zoom-in-center">
    <div class="el-popper is-pure is-light el-dropdown__popper ba-contextmenu" :style="`top: ${state.axis.y + 5}px;left: ${state.axis.x - 14}px;`" :key="Math.random()" v-show="state.show" aria-hidden="false" data-popper-placement="bottom">
      <ul class="el-dropdown-menu">
        <template v-for="(item, idx) in contextmenuItems" :key="idx">
          <li class="el-dropdown-menu__item" :class="item.disabled ? 'is-disabled' : ''" tabindex="-1" @click="onContextmenuItem(item)">
            <span>{{ item.label }}</span>
          </li>
        </template>
      </ul>
      <span class="el-popper__arrow" :style="{ left: `${state.arrowAxis}px` }"></span>
    </div>
  </transition>
</template>

<script setup>
import { useEventListener } from '@vueuse/core';

const emit = defineEmits(['contextmenuItemClick']);
const { proxy } = getCurrentInstance();
const state = reactive({
  show: false,
  axis: {
    x: 0,
    y: 0,
  },
  menu: undefined,
  arrowAxis: 10,
});
const contextmenuItems = ref([
  { name: 'refresh', icon: 'refresh', label: '重新加载', disabled: false },
  { name: 'close', icon: 'close', label: '关闭标签', disabled: false },
  { name: 'closeLeft', icon: 'close', label: '关闭左侧标签', disabled: false },
  { name: 'closeRight', icon: 'close', label: '关闭右侧标签', disabled: false },
  { name: 'closeOther', icon: 'close', label: '关闭其他标签', disabled: false },
  { name: 'closeAll', icon: 'close', label: '关闭全部标签', disabled: false },
]);

const onShowContextmenu = (menu, disabled, axis) => {
  contextmenuItems.value.filter((x) => x.disabled).forEach((x) => (x.disabled = false));
  for (let i = 0; i < disabled.length; i++) {
    contextmenuItems.value[disabled[i]].disabled = true;
  }
  state.menu = menu;
  state.axis = axis;
  state.show = true;
};

const onHideContextmenu = () => {
  state.show = false;
};
onMounted(() => {
  useEventListener(document, 'click', onHideContextmenu);
});

const onContextmenuItem = (item) => {
  if (item.disabled) return;
  emit('contextmenuItemClick', item);
};
defineExpose({ onShowContextmenu });
</script>

<style scoped lang="scss">
.ba-contextmenu {
  z-index: 9999;
}

.el-popper,
.el-popper.is-light .el-popper__arrow::before {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: none;
}

.el-dropdown-menu__item {
  padding: 8px 20px;
  user-select: none;
}

.el-dropdown-menu__item .icon {
  margin-right: 5px;
}

.el-dropdown-menu__item:not(.is-disabled) {
  &:hover {
    background-color: var(--el-dropdown-menuItem-hover-fill);
    color: var(--el-dropdown-menuItem-hover-color);

    .fa {
      color: var(--el-dropdown-menuItem-hover-color) !important;
    }
  }
}
</style>

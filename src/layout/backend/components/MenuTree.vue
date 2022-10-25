<template>
  <template v-for="menu in props.menus">
    <template v-if="menu.children && menu.children.length > 1">
      <el-sub-menu :index="resolvePath(menu.path)" :key="menu.path">
        <template #title>
          <el-icon>
            <icon-park v-if="menu.meta" :type="menu.meta.icon" theme="filled" />
          </el-icon>
          <span>{{ menu.meta.title }}</span>
        </template>
        <menu-tree :menus="menu.children" :base-path="resolvePath(menu.path)"></menu-tree>
      </el-sub-menu>
    </template>
    <template v-else-if="menu.children && menu.children.length === 1">
      <el-menu-item :index="resolvePath(menu.children[0].path)" :key="menu.children[0].path">
        <el-icon>
          <icon-park v-if="menu.children[0].meta" :type="menu.children[0].meta.icon" theme="filled" />
        </el-icon>
        <template #title>
          {{ menu.children[0].meta.title }}
        </template>
      </el-menu-item>
    </template>
    <template v-else>
      <el-menu-item :index="resolvePath(menu.path)" :key="menu.path">
        <el-icon>
          <icon-park v-if="menu.meta" :type="menu.meta.icon" theme="filled" />
        </el-icon>
        <template #title>
          {{ menu.meta.title }}
        </template>
      </el-menu-item>
    </template>
  </template>
</template>

<script setup>
import { isExternal } from '@/utils/validate';
import { getNormalPath } from '@/utils/bit';

const props = defineProps({
  // route object
  menus: {
    type: Array,
    required: true,
  },
  basePath: {
    type: String,
    default: '',
  },
});

function resolvePath(routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  if (routeQuery) {
    let query = JSON.parse(routeQuery);
    return { path: getNormalPath(props.basePath + '/' + routePath), query: query };
  }
  return getNormalPath(props.basePath + '/' + routePath);
}
</script>

<style scoped></style>

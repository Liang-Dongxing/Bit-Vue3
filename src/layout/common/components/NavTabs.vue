<template>
  <el-tabs v-model="editableTabsValue" type="card" closable @tab-change="changeTab" @tab-remove="removeTab">
    <el-tab-pane v-for="item in visitedViews" :key="item.name" :label="item.title" :name="item.name">
      {{ item.content }}
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import useTagsViewStore from '@/store/modules/tagsView';
import { getNormalPath } from '@/utils/bit';
import usePermissionStore from '@/store/modules/permission';

const visitedViews = computed(() => useTagsViewStore().visitedViews);
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const routes = computed(() => usePermissionStore().routes);

const editableTabsValue = ref(route.name);
const affixTags = ref([]);

watch(route, () => {
  addTags();
  moveToCurrentTag();
});

onMounted(() => {
  initTags();
  addTags();
});

function isActive(r) {
  return r.path === route.path;
}

function initTags() {
  const res = filterAffixTags(routes.value);
  affixTags.value = res;
  for (const tag of res) {
    // Must have tag name
    if (tag.name) {
      useTagsViewStore().addVisitedView(tag);
    }
  }
}

function addTags() {
  const { name } = route;
  if (name) {
    useTagsViewStore().addView(route);
    if (route.meta.link) {
      useTagsViewStore().addIframeView(route);
    }
  }
  return false;
}

function moveToCurrentTag() {
  const { name } = route;
  if (name) {
    editableTabsValue.value = name;
  }
  return false;
}

const changeTab = (targetName) => {
  const tag = visitedViews.value.find((item) => item.name === targetName);
  if (tag) {
    router.push(tag.fullPath);
  }
};
const removeTab = (targetName) => {
  const tag = visitedViews.value.find((item) => item.name === targetName);
  if (tag) {
    closeSelectedTag(tag);
  }
};

function closeSelectedTag(view) {
  proxy.$tab.closePage(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view);
    }
  });
}

function toLastView(visitedViews, view) {
  const latestView = visitedViews.slice(-1)[0];
  if (latestView) {
    router.push(latestView.fullPath);
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({ path: '/redirect' + view.fullPath });
    } else {
      router.push('/');
    }
  }
}

function filterAffixTags(routes, basePath = '') {
  let tags = [];
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + route.path);
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta },
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
}
</script>

<style lang="scss" scoped>
.el-tabs {
  --el-tabs-header-height: 50px;
  user-select: none;

  :deep(.el-tabs__item.is-active) {
    background-color: var(--el-bg-color-page);
    border-bottom-color: var(--el-bg-color-page);
  }

  :deep(.el-tabs__header) {
    border-bottom: unset;
    .el-tabs__nav-next,
    .el-tabs__nav-prev {
      line-height: var(--el-tabs-header-height);
    }
    .el-tabs__nav-next:hover,
    .el-tabs__nav-prev:hover {
      background-color: var(--el-bg-color-page);
    }
  }

  :deep(.el-tabs__nav) {
    border: unset;
  }
}
</style>

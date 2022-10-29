<template>
  <el-scrollbar>
    <Breadcrumb v-if="hideBreadcrumb" />
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </el-scrollbar>
</template>

<script setup>
import useTagsViewStore from '@/store/modules/tagsView';
import Breadcrumb from '@/components/Breadcrumb';
import useSettingsStore from '@/store/modules/settings';
const tagsViewStore = useTagsViewStore();
const settingsStore = useSettingsStore();
const storeSettings = computed(() => settingsStore);
const hideBreadcrumb = computed(() => !storeSettings.value.breadcrumb);
</script>

<style lang="scss" scoped></style>

<template>
  <water-mark :text="watermarkContent" :visible="isWatermark">
    <router-view />
  </water-mark>
</template>

<script setup>
import { WaterMark } from '@zu1662/watermark-vue';
import useSettingsStore from '@/store/modules/settings';

const settingsStore = useSettingsStore();
const storeSettings = computed(() => settingsStore);

const isWatermark = computed(() => storeSettings.value.watermark);
const watermarkContent = computed(() => storeSettings.value.watermarkText);
</script>

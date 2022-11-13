<template>
  <el-config-provider :locale="lang">
    <water-mark :text="watermarkContent" :visible="isWatermark">
      <router-view />
    </water-mark>
  </el-config-provider>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import useLanguageStore from '@/store/modules/language';
import { WaterMark } from '@zu1662/watermark-vue';
import useSettingsStore from '@/store/modules/settings';

const settingsStore = useSettingsStore();
const storeSettings = computed(() => settingsStore);

// 初始化 element 的语言包
const { getLocaleMessage } = useI18n();
const lang = getLocaleMessage(useLanguageStore().defaultLang);

const isWatermark = computed(() => storeSettings.value.watermark);
const watermarkContent = computed(() => storeSettings.value.watermarkText);
</script>

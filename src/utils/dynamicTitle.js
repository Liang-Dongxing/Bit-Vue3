import useSettingsStore from '@/store/modules/settings';

/**
 * 动态修改标题
 */
export function useDynamicTitle() {
  const settingsStore = useSettingsStore();
  if (settingsStore.dynamicTitle) {
    document.title = settingsStore.title + ' - ' + settingsStore.appTitle;
  } else {
    document.title = settingsStore.appTitle;
  }
}

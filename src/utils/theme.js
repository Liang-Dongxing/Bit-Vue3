import { useCssVar } from '@vueuse/core';

export const el = ref(null);
const color = useCssVar('--el-color-primary', el);
const color_light_1 = useCssVar('--el-color-primary-light-1', el);
const color_light_2 = useCssVar('--el-color-primary-light-2', el);
const color_light_3 = useCssVar('--el-color-primary-light-3', el);
const color_light_4 = useCssVar('--el-color-primary-light-4', el);
const color_light_5 = useCssVar('--el-color-primary-light-5', el);
const color_light_6 = useCssVar('--el-color-primary-light-6', el);
const color_light_7 = useCssVar('--el-color-primary-light-7', el);
const color_light_8 = useCssVar('--el-color-primary-light-8', el);
const color_light_9 = useCssVar('--el-color-primary-light-9', el);
// 处理主题样式
export function handleThemeStyle(theme, isDark) {
  color.value = theme;
  if (isDark) {
    color_light_1.value = `${getDarkColor(theme, 1 / 10)}`;
    color_light_2.value = `${getDarkColor(theme, 2 / 10)}`;
    color_light_3.value = `${getDarkColor(theme, 3 / 10)}`;
    color_light_4.value = `${getDarkColor(theme, 4 / 10)}`;
    color_light_5.value = `${getDarkColor(theme, 5 / 10)}`;
    color_light_6.value = `${getDarkColor(theme, 6 / 10)}`;
    color_light_7.value = `${getDarkColor(theme, 7 / 10)}`;
    color_light_8.value = `${getDarkColor(theme, 8 / 10)}`;
    color_light_9.value = `${getDarkColor(theme, 9 / 10)}`;
  } else {
    color_light_1.value = `${getLightColor(theme, 1 / 10)}`;
    color_light_2.value = `${getLightColor(theme, 2 / 10)}`;
    color_light_3.value = `${getLightColor(theme, 3 / 10)}`;
    color_light_4.value = `${getLightColor(theme, 4 / 10)}`;
    color_light_5.value = `${getLightColor(theme, 5 / 10)}`;
    color_light_6.value = `${getLightColor(theme, 6 / 10)}`;
    color_light_7.value = `${getLightColor(theme, 7 / 10)}`;
    color_light_8.value = `${getLightColor(theme, 8 / 10)}`;
    color_light_9.value = `${getLightColor(theme, 9 / 10)}`;
  }
}

// hex颜色转rgb颜色
export function hexToRgb(str) {
  str = str.replace('#', '');
  let hexs = str.match(/../g);
  for (let i = 0; i < 3; i++) {
    hexs[i] = parseInt(hexs[i], 16);
  }
  return hexs;
}

// rgb颜色转Hex颜色
export function rgbToHex(r, g, b) {
  let hexs = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i = 0; i < 3; i++) {
    if (hexs[i].length == 1) {
      hexs[i] = `0${hexs[i]}`;
    }
  }
  return `#${hexs.join('')}`;
}

// 变浅颜色值
export function getLightColor(color, level) {
  let rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i]);
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

// 变深颜色值
export function getDarkColor(color, level) {
  let rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor(rgb[i] * (1 - level));
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

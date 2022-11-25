<template>
  <div class="icon-body">
    <el-input v-model="iconName" style="position: relative" clearable :placeholder="$t('om.fuzzy_query')" @clear="filterIcons" @input="filterIcons">
      <template #suffix><i class="el-icon-search el-input__icon" /></template>
    </el-input>
    <div class="icon-list" v-infinite-scroll="load" infinite-scroll-distance="50">
      <div v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
        <svg-icon v-if="item.indexOf('--i') !== -1" :icon-class="item" style="height: 30px; width: 16px" />
        <icon-park v-else :type="item" :size="16" theme="filled" />
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import icons from './requireIcons';

const iconName = ref('');
const iconListAll = ref(icons);
const iconList = ref(iconListAll.value.slice(0, 29));
const emit = defineEmits(['selected']);

const load = () => {
  if (iconList.value.length < iconListAll.value.length) {
    iconList.value = iconListAll.value.slice(0, iconList.value.length + 29);
  }
};

function filterIcons() {
  iconList.value = icons;
  if (iconName.value) {
    iconList.value = icons.filter((item) => item.indexOf(iconName.value) !== -1);
  }
}

function selectedIcon(name) {
  emit('selected', name);
  document.body.click();
}

function reset() {
  iconName.value = '';
  iconList.value = iconListAll.value.slice(0, 29);
}

defineExpose({
  reset,
});
</script>

<style lang="scss" scoped>
.icon-body {
  width: 100%;
  padding: 10px;
  .icon-list {
    height: 200px;
    overflow-y: scroll;
    div {
      height: 30px;
      line-height: 30px;
      margin-bottom: -5px;
      cursor: pointer;
      width: 33%;
      float: left;
    }
    span {
      display: inline-block;
      vertical-align: -0.15em;
      fill: currentColor;
      overflow: hidden;
    }
  }
}
</style>

<template>
  <el-col :span="3" :sm="5" :md="5" :lg="6" :xl="3" class="top-right-btn hidden-xs-only">
    <el-button-group>
      <el-tooltip class="item" effect="dark" :content="showSearch ? $t('om.hide_search') : $t('om.show_search')" placement="top" v-if="search">
        <el-button icon="Search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" :content="$t('om.refresh')" placement="top">
        <el-button icon="Refresh" @click="refresh()" />
      </el-tooltip>
    </el-button-group>
    <el-tooltip class="item" effect="dark" :content="$t('om.hidden_column')" placement="top" v-if="columns">
      <el-dropdown :hide-on-click="false">
        <el-button icon="Menu" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="(item, idx) in columns" :key="idx">
              <el-checkbox @change="dataChange(item)" :checked="!item.visible" :model-value="item.visible" size="small" :label="item.label" />
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-tooltip>
  </el-col>
</template>

<script setup>
const props = defineProps({
  showSearch: {
    type: Boolean,
    default: true,
  },
  columns: {
    type: Array,
  },
  search: {
    type: Boolean,
    default: true,
  },
  gutter: {
    type: Number,
    default: 10,
  },
});

const emits = defineEmits(['update:showSearch', 'queryTable']);

// 搜索
function toggleSearch() {
  emits('update:showSearch', !props.showSearch);
}

// 刷新
function refresh() {
  emits('queryTable');
}

// 右侧列表元素变化
function dataChange(item) {
  item.visible = !item.visible;
}

// 显隐列初始默认隐藏列
for (let item in props.columns) {
  if (props.columns[item].visible === false) {
    value.value.push(parseInt(item));
  }
}
</script>

<style lang="scss" scoped>
.top-right-btn {
  display: flex;
  justify-content: flex-end;

  .el-dropdown {
    margin-left: 4px;
  }
}
</style>

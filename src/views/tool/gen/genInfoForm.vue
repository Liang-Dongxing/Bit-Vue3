<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" :label-position="settingsStore.labelPosition" label-width="150px">
    <el-form-item prop="tplCategory">
      <template #label>{{ $t('om.gen.genInfoForm.label1') }}</template>
      <el-select v-model="info.tplCategory" @change="tplSelectChange">
        <el-option :label="$t('om.gen.genInfoForm.label18')" value="crud" />
        <el-option :label="$t('om.gen.genInfoForm.label19')" value="tree" />
        <el-option :label="$t('om.gen.genInfoForm.label20')" value="sub" />
      </el-select>
    </el-form-item>
    <el-form-item prop="packageName">
      <template #label>
        {{ $t('om.gen.genInfoForm.label2') }}
        <el-tooltip :content="$t('om.gen.genInfoForm.content1')" placement="top">
          <el-icon><question-filled /></el-icon>
        </el-tooltip>
      </template>
      <el-input v-model="info.packageName" />
    </el-form-item>
    <el-form-item prop="moduleName">
      <template #label>
        {{ $t('om.gen.genInfoForm.label3') }}
        <el-tooltip :content="$t('om.gen.genInfoForm.content2')" placement="top">
          <el-icon><question-filled /></el-icon>
        </el-tooltip>
      </template>
      <el-input v-model="info.moduleName" />
    </el-form-item>
    <el-form-item prop="businessName">
      <template #label>
        {{ $t('om.gen.genInfoForm.label4') }}
        <el-tooltip :content="$t('om.gen.genInfoForm.content3')" placement="top">
          <el-icon><question-filled /></el-icon>
        </el-tooltip>
      </template>
      <el-input v-model="info.businessName" />
    </el-form-item>
    <el-form-item prop="functionName">
      <template #label>
        {{ $t('om.gen.genInfoForm.label5') }}
        <el-tooltip :content="$t('om.gen.genInfoForm.content4')" placement="top">
          <el-icon><question-filled /></el-icon>
        </el-tooltip>
      </template>
      <el-input v-model="info.functionName" />
    </el-form-item>
    <el-form-item>
      <template #label>
        {{ $t('om.gen.genInfoForm.label6') }}
        <el-tooltip :content="$t('om.gen.genInfoForm.content5')" placement="top">
          <el-icon><question-filled /></el-icon>
        </el-tooltip>
      </template>
      <tree-select v-model:value="info.parentMenuId" :options="menuOptions" :obj-map="{ value: 'menuId', label: 'menuName', children: 'children' }" :placeholder="$t('om.select')" />
    </el-form-item>
    <el-form-item prop="genType">
      <template #label>
        {{ $t('om.gen.genInfoForm.label7') }}
        <el-tooltip :content="$t('om.gen.genInfoForm.content6')" placement="top">
          <el-icon><question-filled /></el-icon>
        </el-tooltip>
      </template>
      <el-radio v-model="info.genType" label="0">zip压缩包</el-radio>
      <el-radio v-model="info.genType" label="1">自定义路径</el-radio>
    </el-form-item>
    <el-form-item v-if="info.genType == '1'" prop="genPath">
      <template #label>
        {{ $t('om.gen.genInfoForm.label8') }}
        <el-tooltip :content="$t('om.gen.genInfoForm.content7')" placement="top">
          <el-icon><question-filled /></el-icon>
        </el-tooltip>
      </template>
      <el-input v-model="info.genPath">
        <template #append>
          <el-dropdown>
            <el-button type="primary">
              {{ $t('om.gen.genInfoForm.label9') }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="info.genPath = '/'">{{ $t('om.gen.genInfoForm.label10') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-input>
    </el-form-item>

    <template v-if="info.tplCategory == 'tree'">
      <h4 class="form-header">{{ $t('om.gen.genInfoForm.label11') }}</h4>
      <el-row v-show="info.tplCategory == 'tree'">
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('om.gen.genInfoForm.label12') }}
              <el-tooltip :content="$t('om.gen.genInfoForm.content8')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeCode" :placeholder="$t('om.select')">
              <el-option v-for="(column, index) in info.columns" :key="index" :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('om.gen.genInfoForm.label13') }}
              <el-tooltip :content="$t('om.gen.genInfoForm.content9')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeParentCode" :placeholder="$t('om.select')">
              <el-option v-for="(column, index) in info.columns" :key="index" :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('om.gen.genInfoForm.label14') }}
              <el-tooltip :content="$t('om.gen.genInfoForm.content10')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeName" :placeholder="$t('om.select')">
              <el-option v-for="(column, index) in info.columns" :key="index" :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <template v-if="info.tplCategory == 'sub'">
      <h4 class="form-header">{{ $t('om.gen.genInfoForm.label15') }}</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('om.gen.genInfoForm.label16') }}
              <el-tooltip :content="$t('om.gen.genInfoForm.content11')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableName" :placeholder="$t('om.select')" @change="subSelectChange">
              <el-option v-for="(table, index) in tables" :key="index" :label="table.tableName + '：' + table.tableComment" :value="table.tableName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('om.gen.genInfoForm.label17') }}
              <el-tooltip :content="$t('om.gen.genInfoForm.content12')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableFkName" :placeholder="$t('om.select')">
              <el-option v-for="(column, index) in subColumns" :key="index" :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
  </el-form>
</template>

<script setup>
import { listMenu } from '@/api/system/menu';
import useSettingsStore from '@/store/modules/settings';

const subColumns = ref([]);
const menuOptions = ref([]);
const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const props = defineProps({
  info: {
    type: Object,
    default: null,
  },
  tables: {
    type: Array,
    default: null,
  },
});

// 表单校验
const rules = ref({
  tplCategory: [{ required: true, message: proxy.$t('om.gen.genInfoForm.msg1'), trigger: 'blur' }],
  packageName: [{ required: true, message: proxy.$t('om.gen.genInfoForm.msg2'), trigger: 'blur' }],
  moduleName: [{ required: true, message: proxy.$t('om.gen.genInfoForm.msg3'), trigger: 'blur' }],
  businessName: [{ required: true, message: proxy.$t('om.gen.genInfoForm.msg4'), trigger: 'blur' }],
  functionName: [{ required: true, message: proxy.$t('om.gen.genInfoForm.msg5'), trigger: 'blur' }],
});
function subSelectChange(value) {
  props.info.subTableFkName = '';
}
function tplSelectChange(value) {
  if (value !== 'sub') {
    props.info.subTableName = '';
    props.info.subTableFkName = '';
  }
}
function setSubTableColumns(value) {
  for (var item in props.tables) {
    const name = props.tables[item].tableName;
    if (value === name) {
      subColumns.value = props.tables[item].columns;
      break;
    }
  }
}
/** 查询菜单下拉树结构 */
function getMenuTreeselect() {
  listMenu().then((response) => {
    menuOptions.value = proxy.handleTree(response.data, 'menuId');
  });
}

watch(
  () => props.info.subTableName,
  (val) => {
    setSubTableColumns(val);
  },
);

getMenuTreeselect();
</script>

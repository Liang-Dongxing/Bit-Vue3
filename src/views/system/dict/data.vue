<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.dict.name')" prop="dictType">
        <el-select v-model="queryParams.dictType">
          <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.dict.label')" prop="dictLabel">
        <el-input v-model="queryParams.dictLabel" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('om.select')" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:dict:add']">{{ $t('om.add') }}</el-button>
        <el-button type="success" icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:dict:edit']">{{ $t('om.edit') }}</el-button>
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:dict:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['system:dict:export']">{{ $t('om.export') }}</el-button>
        <el-button type="warning" icon="Close" @click="handleClose">{{ $t('om.close') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('om.id')" align="center" prop="dictCode" />
      <el-table-column :label="$t('om.dict.label')" align="center" prop="dictLabel">
        <template #default="scope">
          <span v-if="scope.row.listClass == '' || scope.row.listClass == 'default'">{{ scope.row.dictLabel }}</span>
          <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass">{{ scope.row.dictLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.dict.value')" align="center" prop="dictValue" />
      <el-table-column :label="$t('om.sort')" align="center" prop="dictSort" />
      <el-table-column :label="$t('om.status')" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.remarks')" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.creation_time')" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation')" align="center" width="150" class-name="om-table-operation">
        <template #default="scope">
          <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']"></el-button>
          <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="dataRef" :model="form" :rules="rules" :label-position="settingsStore.labelPosition" label-width="80px">
        <el-form-item :label="$t('om.dict.type')">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('om.dict.label1')" prop="dictLabel">
          <el-input v-model="form.dictLabel" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.dict.label2')" prop="dictValue">
          <el-input v-model="form.dictValue" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.dict.label3')" prop="cssClass">
          <el-input v-model="form.cssClass" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.sort')" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('om.dict.label5')" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option v-for="item in listClassOptions" :key="item.value" :label="item.label + '(' + item.value + ')'" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('om.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('om.remarks')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('om.please_enter')"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ $t('om.save') }}</el-button>
          <el-button @click="cancel">{{ $t('om.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Data">
import useDictStore from '@/store/modules/dict';
import { getType, optionselect as getDictOptionselect } from '@/api/system/dict/type';
import { addData, delData, getData, listData, updateData } from '@/api/system/dict/data';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const dataList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const defaultDictType = ref('');
const typeOptions = ref([]);
const route = useRoute();
// 数据标签回显样式
const listClassOptions = ref([
  { value: 'default', label: proxy.$t('om.default') },
  { value: 'primary', label: proxy.$t('om.primary') },
  { value: 'success', label: proxy.$t('om.success') },
  { value: 'info', label: proxy.$t('om.info') },
  { value: 'warning', label: proxy.$t('om.warning') },
  { value: 'danger', label: proxy.$t('om.danger') },
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: undefined,
    dictType: undefined,
    status: undefined,
  },
  rules: {
    dictLabel: [{ required: true, message: proxy.$t('om.dict.rules3'), trigger: 'blur' }],
    dictValue: [{ required: true, message: proxy.$t('om.dict.rules4'), trigger: 'blur' }],
    dictSort: [{ required: true, message: proxy.$t('om.dict.rules5'), trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询字典类型详细 */
function getTypes(dictId) {
  getType(dictId).then((response) => {
    queryParams.value.dictType = response.data.dictType;
    defaultDictType.value = response.data.dictType;
    getList();
  });
}

/** 查询字典类型列表 */
function getTypeList() {
  getDictOptionselect().then((response) => {
    typeOptions.value = response.data;
  });
}
/** 查询字典数据列表 */
function getList() {
  loading.value = true;
  listData(queryParams.value).then((response) => {
    dataList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    cssClass: undefined,
    listClass: 'default',
    dictSort: 0,
    status: '0',
    remark: undefined,
  };
  proxy.resetForm('dataRef');
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 返回按钮操作 */
function handleClose() {
  const obj = { path: '/system/dict' };
  proxy.$tab.closeOpenPage(obj);
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef');
  queryParams.value.dictType = defaultDictType;
  handleQuery();
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = proxy.$t('om.dict.add2');
  form.value.dictType = queryParams.value.dictType;
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.dictCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const dictCode = row.dictCode || ids.value;
  getData(dictCode).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = proxy.$t('om.dict.edit2');
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['dataRef'].validate((valid) => {
    if (valid) {
      if (form.value.dictCode != undefined) {
        updateData(form.value).then((response) => {
          useDictStore().removeDict(queryParams.value.dictType);
          proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
          open.value = false;
          getList();
        });
      } else {
        addData(form.value).then((response) => {
          useDictStore().removeDict(queryParams.value.dictType);
          proxy.$modal.msgSuccess(proxy.$t('om.message.add'));
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row) {
  const dictCodes = row.dictCode || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: dictCodes }))
    .then(function () {
      return delData(dictCodes);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.message.delete'));
      useDictStore().removeDict(queryParams.value.dictType);
    })
    .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'system/dict/data/export',
    {
      ...queryParams.value,
    },
    `dict_data_${new Date().getTime()}.xlsx`,
  );
}

getTypes(route.params && route.params.dictId);
getTypeList();
</script>

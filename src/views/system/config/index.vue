<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.config.name')" prop="configName">
        <el-input v-model="queryParams.configName" :placeholder="$t('om.fuzzy_query')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.config.key')" prop="configKey">
        <el-input v-model="queryParams.configKey" :placeholder="$t('om.fuzzy_query')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.config.type')" prop="configType">
        <el-select v-model="queryParams.configType" :placeholder="$t('om.select')" clearable>
          <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.creation_time')" style="width: 308px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" :start-placeholder="$t('om.start_date')" :end-placeholder="$t('om.end_date')"></el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:config:add']">{{ $t('om.add') }}</el-button>
        <el-button type="success" icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:config:edit']">{{ $t('om.edit') }}</el-button>
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:config:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['system:config:export']">{{ $t('om.export') }}</el-button>
        <el-button type="danger" icon="Refresh" @click="handleRefreshCache" v-hasPermi="['system:config:remove']">{{ $t('om.refresh_cache') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('om.id')" align="center" prop="configId" width="120" />
      <el-table-column :label="$t('om.config.name')" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.config.key')" align="center" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.config.value')" align="center" prop="configValue" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.config.type')" align="center" prop="configType">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
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
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:config:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:config:remove']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="configRef" :model="form" :rules="rules" :label-position="settingsStore.labelPosition" label-width="80px">
        <el-form-item :label="$t('om.config.name')" prop="configName">
          <el-input v-model="form.configName" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.config.key')" prop="configKey">
          <el-input v-model="form.configKey" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.config.value')" prop="configValue">
          <el-input v-model="form.configValue" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.config.type')" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('om.remarks')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('om.please_enter')" />
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

<script setup name="Config">
import { addConfig, delConfig, getConfig, listConfig, refreshCache, updateConfig } from '@/api/system/config';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_yes_no } = proxy.useDict('sys_yes_no');

const configList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    configKey: undefined,
    configType: undefined,
  },
  rules: {
    configName: [{ required: true, message: proxy.$t('om.config.rules1'), trigger: 'blur' }],
    configKey: [{ required: true, message: proxy.$t('om.config.rules2'), trigger: 'blur' }],
    configValue: [{ required: true, message: proxy.$t('om.config.rules3'), trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询参数列表 */
function getList() {
  loading.value = true;
  listConfig(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    configList.value = response.rows;
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
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: 'Y',
    remark: undefined,
  };
  proxy.resetForm('configRef');
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm('queryRef');
  handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = proxy.$t('om.config.add');
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const configId = row.configId || ids.value;
  getConfig(configId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = proxy.$t('om.config.edit');
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['configRef'].validate((valid) => {
    if (valid) {
      if (form.value.configId != undefined) {
        updateConfig(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
          open.value = false;
          getList();
        });
      } else {
        addConfig(form.value).then((response) => {
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
  const configIds = row.configId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: configIds }))
    .then(function () {
      return delConfig(configIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.message.delete'));
    })
    .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'system/config/export',
    {
      ...queryParams.value,
    },
    `config_${new Date().getTime()}.xlsx`,
  );
}
/** 刷新缓存按钮操作 */
function handleRefreshCache() {
  refreshCache().then(() => {
    proxy.$modal.msgSuccess(proxy.$t('om.refresh_successful'));
  });
}

getList();
</script>

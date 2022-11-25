<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.operlog.title')" prop="title">
        <el-input v-model="queryParams.title" :placeholder="$t('om.fuzzy_query')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.operlog.create')" prop="operName">
        <el-input v-model="queryParams.operName" :placeholder="$t('om.fuzzy_query')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.operlog.type')" prop="businessType">
        <el-select v-model="queryParams.businessType" :placeholder="$t('om.select')" clearable style="width: 240px">
          <el-option v-for="dict in sys_oper_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('om.select')" clearable style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.operation_time')" style="width: 308px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" :start-placeholder="$t('om.start_date')" :end-placeholder="$t('om.end_date')"></el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['monitor:operlog:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="danger" icon="Delete" @click="handleClean" v-hasPermi="['monitor:operlog:remove']">{{ $t('om.empty') }}</el-button>
        <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['monitor:operlog:export']">{{ $t('om.export') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="operlogRef" v-loading="loading" :data="operlogList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('om.id')" align="center" prop="operId" width="120" />
      <el-table-column :label="$t('om.operlog.title')" align="center" prop="title" />
      <el-table-column :label="$t('om.operlog.type')" align="center" prop="businessType">
        <template #default="scope">
          <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operlog.method')" align="center" prop="requestMethod" />
      <el-table-column :label="$t('om.operlog.create')" align="center" prop="operName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" width="120" />
      <el-table-column :label="$t('om.operlog.host')" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.status')" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation_time')" align="center" prop="operTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.operTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation')" align="center" class-name="om-table-operation" width="150">
        <template #default="scope">
          <el-tooltip :content="$t('om.details')" placement="top">
            <el-button icon="View" @click="handleView(scope.row, scope.index)" v-hasPermi="['monitor:operlog:query']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 操作日志详细 -->
    <el-dialog :title="$t('om.operlog.label10')" v-model="open" width="700px" append-to-body>
      <el-descriptions class="margin-top" :column="1" border>
        <el-descriptions-item :label="$t('om.operlog.label1')">{{ form.title }} / {{ typeFormat(form) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.operlog.label2')">{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.operlog.label3')">{{ form.operUrl }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.operlog.label4')">{{ form.requestMethod }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.operlog.label5')">{{ form.method }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.operlog.label6')">{{ form.operParam }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.operlog.label7')">{{ form.jsonResult }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.operlog.label8')">
          <div v-if="form.status === 0">{{ $t('om.normal') }}</div>
          <div v-else-if="form.status === 1">{{ $t('om.failure') }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('om.operation_time')">{{ parseTime(form.operTime) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.exception_information')" v-if="form.status === 1">{{ form.errorMsg }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">{{ $t('om.close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Operlog">
import { cleanOperlog, delOperlog, list } from '@/api/monitor/operlog';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_oper_type, sys_common_status } = proxy.useDict('sys_oper_type', 'sys_common_status');

const operlogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const dateRange = ref([]);
const defaultSort = ref({ prop: 'operTime', order: 'descending' });

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined,
  },
});

const { queryParams, form } = toRefs(data);

/** 查询登录日志 */
function getList() {
  loading.value = true;
  list(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    operlogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 操作日志类型字典翻译 */
function typeFormat(row, column) {
  return proxy.selectDictLabel(sys_oper_type.value, row.businessType);
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
  queryParams.value.pageNum = 1;
  proxy.$refs['operlogRef'].sort(defaultSort.value.prop, defaultSort.value.order);
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.operId);
  multiple.value = !selection.length;
}
/** 排序触发事件 */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/** 详细按钮操作 */
function handleView(row) {
  open.value = true;
  form.value = row;
}
/** 删除按钮操作 */
function handleDelete(row) {
  const operIds = row.operId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: operIds }))
    .then(function () {
      return delOperlog(operIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.message.delete'));
    })
    .catch(() => {});
}
/** 清空按钮操作 */
function handleClean() {
  proxy.$modal
    .confirm(proxy.$t('om.operlog.msg1'))
    .then(function () {
      return cleanOperlog();
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
    'monitor/operlog/export',
    {
      ...queryParams.value,
    },
    `config_${new Date().getTime()}.xlsx`,
  );
}

getList();
</script>

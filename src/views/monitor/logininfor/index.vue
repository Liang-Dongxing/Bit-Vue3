<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.logininfor.ipaddr')" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" :placeholder="$t('om.fuzzy_query')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.user.name')" prop="userName">
        <el-input v-model="queryParams.userName" :placeholder="$t('om.fuzzy_query')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('om.select')" clearable style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.logininfor.dateRange')" style="width: 308px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" :start-placeholder="$t('om.start_date')" :end-placeholder="$t('om.end_date')"></el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="danger" icon="Delete" @click="handleClean" v-hasPermi="['monitor:logininfor:remove']">{{ $t('om.empty') }}</el-button>
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['monitor:logininfor:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="primary" icon="Unlock" :disabled="single" @click="handleUnlock" v-hasPermi="['monitor:logininfor:unlock']">{{ $t('om.unlock') }}</el-button>
        <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['monitor:logininfor:export']">{{ $t('om.export') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="logininforRef" v-loading="loading" :data="logininforList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('om.id')" align="center" prop="infoId" width="120" />
      <el-table-column :label="$t('om.user.name')" align="center" prop="userName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column :label="$t('om.logininfor.ipaddr')" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.logininfor.loginLocation')" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.logininfor.os')" align="center" prop="os" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.logininfor.browser')" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.status')" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.logininfor.msg')" align="center" prop="msg" />
      <el-table-column :label="$t('om.logininfor.dateRange')" align="center" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="Logininfor">
import { cleanLogininfor, delLogininfor, list, unlockLogininfor } from '@/api/monitor/logininfor';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_common_status } = proxy.useDict('sys_common_status');

const logininforList = ref([]);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const selectName = ref('');
const total = ref(0);
const dateRange = ref([]);
const defaultSort = ref({ prop: 'loginTime', order: 'descending' });

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  ipaddr: undefined,
  userName: undefined,
  status: undefined,
  orderByColumn: undefined,
  isAsc: undefined,
});

/** 查询登录日志列表 */
function getList() {
  loading.value = true;
  list(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    logininforList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
  proxy.$refs['logininforRef'].sort(defaultSort.value.prop, defaultSort.value.order);
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.infoId);
  multiple.value = !selection.length;
  single.value = selection.length != 1;
  selectName.value = selection.map((item) => item.userName);
}
/** 排序触发事件 */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/** 删除按钮操作 */
function handleDelete(row) {
  const infoIds = row.infoId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: infoIds }))
    .then(function () {
      return delLogininfor(infoIds);
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
    .confirm(proxy.$t('om.logininfor.msg1'))
    .then(function () {
      return cleanLogininfor();
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.empty') + proxy.$t('om.success'));
    })
    .catch(() => {});
}
/** 解锁按钮操作 */
function handleUnlock() {
  const username = selectName.value;
  proxy.$modal
    .confirm(proxy.$t('om.logininfor.msg2', { field: username }))
    .then(function () {
      return unlockLogininfor(username);
    })
    .then(() => {
      proxy.$modal.msgSuccess(proxy.$t('om.logininfor.msg3', { field: username }));
    })
    .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'monitor/logininfor/export',
    {
      ...queryParams.value,
    },
    `config_${new Date().getTime()}.xlsx`,
  );
}

getList();
</script>

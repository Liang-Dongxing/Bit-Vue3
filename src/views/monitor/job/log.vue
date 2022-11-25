<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.job.name')" prop="jobName">
        <el-input v-model="queryParams.jobName" :placeholder="$t('om.fuzzy_query')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.job.group')" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" :placeholder="$t('om.select')" clearable style="width: 240px">
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('om.select')" clearable style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.job.label13')" style="width: 308px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" :start-placeholder="$t('om.start_date')" :end-placeholder="$t('om.end_date')"></el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['monitor:job:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="danger" icon="Delete" @click="handleClean" v-hasPermi="['monitor:job:remove']">{{ $t('om.empty') }}</el-button>
        <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['monitor:job:export']">{{ $t('om.export') }}</el-button>
        <el-button type="warning" icon="Close" @click="handleClose">{{ $t('om.close') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="jobLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('om.id')" width="80" align="center" prop="jobLogId" />
      <el-table-column :label="$t('om.job.name')" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.job.group')" align="center" prop="jobGroup" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.job.method')" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.log_information')" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.status')" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.job.label13')" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation')" align="center" class-name="om-table-operation" width="150">
        <template #default="scope">
          <el-button icon="View" @click="handleView(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 调度日志详细 -->
    <el-dialog :title="$t('om.job.details2')" v-model="open" width="700px" append-to-body>
      <el-descriptions class="margin-top" :column="1" border>
        <el-descriptions-item :label="$t('om.id')">{{ form.jobLogId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.name')">{{ form.jobName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.group')">{{ form.jobGroup }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.label13')">{{ form.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.label1')">{{ form.invokeTarget }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.log_information')">{{ form.jobMessage }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.status')">
          <div v-if="form.status == 0">{{ $t('om.normal') }}</div>
          <div v-else-if="form.status == 1">{{ $t('om.failure') }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('om.exception_information')" v-if="form.status == 1">{{ form.exceptionInfo }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">{{ $t('om.close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="JobLog">
import { getJob } from '@/api/monitor/job';
import { cleanJobLog, delJobLog, listJobLog } from '@/api/monitor/jobLog';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_common_status, sys_job_group } = proxy.useDict('sys_common_status', 'sys_job_group');

const jobLogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref([]);
const route = useRoute();

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: undefined,
    dictType: undefined,
    status: undefined,
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询调度日志列表 */
function getList() {
  loading.value = true;
  listJobLog(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    jobLogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 返回按钮
function handleClose() {
  const obj = { path: '/monitor/job' };
  proxy.$tab.closeOpenPage(obj);
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
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.jobLogId);
  multiple.value = !selection.length;
}
/** 详细按钮操作 */
function handleView(row) {
  open.value = true;
  form.value = row;
}
/** 删除按钮操作 */
function handleDelete(row) {
  const jobIds = row.jobLogId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: jobIds }))
    .then(function () {
      return delJobLog(jobIds);
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
    .confirm(proxy.$t('om.job.msg3'))
    .then(function () {
      return cleanJobLog();
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.empty') + proxy.$t('om.success'));
    })
    .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'monitor/jobLog/export',
    {
      ...queryParams.value,
    },
    `job_log_${new Date().getTime()}.xlsx`,
  );
}

(() => {
  const jobId = route.params && route.params.jobId;
  if (jobId !== undefined && jobId != 0) {
    getJob(jobId).then((response) => {
      queryParams.value.jobName = response.data.jobName;
      queryParams.value.jobGroup = response.data.jobGroup;
      getList();
    });
  } else {
    getList();
  }
})();

getList();
</script>

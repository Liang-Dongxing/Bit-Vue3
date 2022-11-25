<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.job.name')" prop="jobName">
        <el-input v-model="queryParams.jobName" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.job.group')" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" :placeholder="$t('om.select')" clearable>
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('om.select')" clearable>
          <el-option v-for="dict in sys_job_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['monitor:job:add']">{{ $t('om.add') }}</el-button>
        <el-button type="success" icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['monitor:job:edit']">{{ $t('om.edit') }}</el-button>
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['monitor:job:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="info" icon="Operation" @click="handleJobLog" v-hasPermi="['monitor:job:query']">{{ $t('om.log') }}</el-button>
        <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['monitor:job:export']">
          {{ $t('om.export') }}
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('om.id')" width="100" align="center" prop="jobId" />
      <el-table-column :label="$t('om.job.name')" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.job.group')" align="center" prop="jobGroup">
        <template #default="scope">
          <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.job.method')" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.job.cron')" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.status')" align="center" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation')" align="center" width="200" class-name="om-table-operation">
        <template #default="scope">
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['monitor:job:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.delete')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['monitor:job:remove']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.perform_once')" placement="top">
            <el-button icon="CaretRight" @click="handleRun(scope.row)" v-hasPermi="['monitor:job:changeStatus']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.task_details')" placement="top">
            <el-button icon="View" @click="handleView(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.scheduling_log')" placement="top">
            <el-button icon="Operation" @click="handleJobLog(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改定时任务对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="jobRef" :model="form" :rules="rules" :label-position="settingsStore.labelPosition" label-width="120px">
        <el-form-item :label="$t('om.job.name')" prop="jobName">
          <el-input v-model="form.jobName" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.job.group')" prop="jobGroup">
          <el-select v-model="form.jobGroup" :placeholder="$t('om.select')">
            <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="invokeTarget">
          <template #label>
            <span>
              {{ $t('om.job.label1') }}
              <el-tooltip placement="top">
                <template #content>
                  <div>
                    {{ $t('om.job.content1') }}
                    <br />
                    {{ $t('om.job.content2') }}
                    <br />
                    {{ $t('om.job.content3') }}
                  </div>
                </template>
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="form.invokeTarget" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.job.cron')" prop="cronExpression">
          <el-input v-model="form.cronExpression" :placeholder="$t('om.please_enter')" readonly>
            <template #append>
              <el-button type="primary" @click="handleShowCron">
                {{ $t('om.job.label9') }}
                <i class="el-icon-time el-icon--right"></i>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('om.job.label2')" prop="misfirePolicy">
          <el-radio-group v-model="form.misfirePolicy">
            <el-radio-button label="1">{{ $t('om.job.label4') }}</el-radio-button>
            <el-radio-button label="2">{{ $t('om.job.label5') }}</el-radio-button>
            <el-radio-button label="3">{{ $t('om.job.label6') }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('om.job.label3')" prop="concurrent">
          <el-radio-group v-model="form.concurrent">
            <el-radio-button label="0">{{ $t('om.job.label7') }}</el-radio-button>
            <el-radio-button label="1">{{ $t('om.job.label8') }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('om.status')">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_job_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ $t('om.save') }}</el-button>
          <el-button @click="cancel">{{ $t('om.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="$t('om.job.cron_gen')" v-model="openCron" append-to-body destroy-on-close>
      <crontab ref="crontabRef" @hide="openCron = false" @fill="crontabFill" :expression="expression"></crontab>
    </el-dialog>

    <!-- 任务日志详细 -->
    <el-dialog :title="$t('om.job.details1')" v-model="openView" width="700px" append-to-body>
      <el-descriptions class="margin-top" :column="2" border>
        <el-descriptions-item :label="$t('om.id')">{{ form.jobId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.name')">{{ form.jobName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.group')">{{ jobGroupFormat(form) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.creation_time')">{{ form.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.cron')">{{ form.cronExpression }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.label11')">{{ parseTime(form.nextValidTime) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.label12')">{{ form.invokeTarget }}</el-descriptions-item>
        <el-descriptions-item :label="$t('om.status')">
          <div v-if="form.status == 0">{{ $t('om.normal') }}</div>
          <div v-else-if="form.status == 1">{{ $t('om.failure') }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.label3')">
          <div v-if="form.concurrent == 0">{{ $t('om.job.label7') }}</div>
          <div v-else-if="form.concurrent == 1">{{ $t('om.job.label8') }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('om.job.label2')">
          <div v-if="form.misfirePolicy == 0">{{ $t('om.job.label11') }}</div>
          <div v-else-if="form.misfirePolicy == 1">{{ $t('om.job.label4') }}</div>
          <div v-else-if="form.misfirePolicy == 2">{{ $t('om.job.label5') }}</div>
          <div v-else-if="form.misfirePolicy == 3">{{ $t('om.job.label6') }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openView = false">{{ $t('om.close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Job">
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from '@/api/monitor/job';
import Crontab from '@/components/Crontab';
import useSettingsStore from '@/store/modules/settings';

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_job_group, sys_job_status } = proxy.useDict('sys_job_group', 'sys_job_status');

const settingsStore = useSettingsStore();
const jobList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const openView = ref(false);
const openCron = ref(false);
const expression = ref('');

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined,
  },
  rules: {
    jobName: [{ required: true, message: proxy.$t('om.job.rules1'), trigger: 'blur' }],
    invokeTarget: [{ required: true, message: proxy.$t('om.job.rules2'), trigger: 'blur' }],
    cronExpression: [{ required: true, message: proxy.$t('om.job.rules3'), trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询定时任务列表 */
function getList() {
  loading.value = true;
  listJob(queryParams.value).then((response) => {
    jobList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 任务组名字典翻译 */
function jobGroupFormat(row, column) {
  return proxy.selectDictLabel(sys_job_group.value, row.jobGroup);
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: 1,
    concurrent: 1,
    status: '0',
  };
  proxy.resetForm('jobRef');
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.jobId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

// 更多操作触发
function handleCommand(command, row) {
  switch (command) {
    case 'handleRun':
      handleRun(row);
      break;
    case 'handleView':
      handleView(row);
      break;
    case 'handleJobLog':
      handleJobLog(row);
      break;
    default:
      break;
  }
}

// 任务状态修改
function handleStatusChange(row) {
  let text = row.status === '0' ? proxy.$t('om.enabled') : proxy.$t('om.deactivation');
  proxy.$modal
    .confirm(proxy.$t('om.job.msg1', { field: row.jobName }))
    .then(function () {
      return changeJobStatus(row.jobId, row.status);
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + proxy.$t('om.success'));
    })
    .catch(function () {
      row.status = row.status === '0' ? '1' : '0';
    });
}

/* 立即执行一次 */
function handleRun(row) {
  proxy.$modal
    .confirm(proxy.$t('om.job.msg2', { field: row.jobName }))
    .then(function () {
      return runJob(row.jobId, row.jobGroup);
    })
    .then(() => {
      proxy.$modal.msgSuccess(proxy.$t('om.perform') + proxy.$t('om.success'));
    })
    .catch(() => {});
}

/** 任务详细信息 */
function handleView(row) {
  getJob(row.jobId).then((response) => {
    form.value = response.data;
    openView.value = true;
  });
}

/** cron表达式按钮操作 */
function handleShowCron() {
  expression.value = form.value.cronExpression;
  openCron.value = true;
}

/** 确定后回传值 */
function crontabFill(value) {
  form.value.cronExpression = value;
}

/** 任务日志列表查询 */
function handleJobLog(row) {
  const jobId = row.jobId || 0;
  router.push('/monitor/job-log/index/' + jobId);
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = proxy.$t('om.job.add');
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const jobId = row.jobId || ids.value;
  getJob(jobId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = proxy.$t('om.job.edit');
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['jobRef'].validate((valid) => {
    if (valid) {
      if (form.value.jobId != undefined) {
        updateJob(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
          open.value = false;
          getList();
        });
      } else {
        addJob(form.value).then((response) => {
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
  const jobIds = row.jobId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: jobIds }))
    .then(function () {
      return delJob(jobIds);
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
    'monitor/job/export',
    {
      ...queryParams.value,
    },
    `job_${new Date().getTime()}.xlsx`,
  );
}

getList();
</script>

<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.gen.tableName')" prop="tableName">
        <el-input v-model="queryParams.tableName" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.gen.tableComment')" prop="tableComment">
        <el-input v-model="queryParams.tableComment" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
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
        <el-button type="primary" icon="Download" @click="handleGenTable" v-hasPermi="['tool:gen:code']">{{ $t('om.generate') }}</el-button>
        <el-button type="info" icon="Upload" @click="openImportTable" v-hasPermi="['tool:gen:import']">{{ $t('om.import') }}</el-button>
        <el-button type="success" icon="Edit" :disabled="single" @click="handleEditTable" v-hasPermi="['tool:gen:edit']">{{ $t('om.edit') }}</el-button>
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['tool:gen:remove']">{{ $t('om.delete') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column :label="$t('om.id')" type="index" width="120" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.gen.tableName')" align="center" prop="tableName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.gen.tableComment')" align="center" prop="tableComment" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.gen.className')" align="center" prop="className" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.creation_time')" align="center" prop="createTime" width="180" />
      <el-table-column :label="$t('om.update_time')" align="center" prop="updateTime" width="180" />
      <el-table-column :label="$t('om.operation')" align="center" width="330" class-name="om-table-operation">
        <template #default="scope">
          <el-tooltip :content="$t('om.preview')" placement="top">
            <el-button icon="View" @click="handlePreview(scope.row)" v-hasPermi="['tool:gen:preview']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="success" icon="Edit" @click="handleEditTable(scope.row)" v-hasPermi="['tool:gen:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.delete')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['tool:gen:remove']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.sync')" placement="top">
            <el-button icon="Refresh" @click="handleSynchDb(scope.row)" v-hasPermi="['tool:gen:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.gen.code')" placement="top">
            <el-button icon="Download" @click="handleGenTable(scope.row)" v-hasPermi="['tool:gen:code']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <!-- 预览界面 -->
    <el-dialog :title="preview.title" v-model="preview.open" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane v-for="(value, key) in preview.data" :label="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))" :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))" :key="value">
          <el-link :underline="false" icon="DocumentCopy" v-copyText="value" v-copyText:callback="copyTextSuccess" style="float: right">&nbsp;{{ $t('om.copy') }}</el-link>
          <pre>{{ value }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="importRef" @ok="handleQuery" />
  </div>
</template>

<script setup name="Gen">
import { delTable, genCode, listTable, previewTable, synchDb } from '@/api/tool/gen';
import router from '@/router';
import useSettingsStore from '@/store/modules/settings';
import ImportTable from '@/views/tool/gen/importTable';

const route = useRoute();
const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const tableList = ref([]);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const tableNames = ref([]);
const dateRange = ref([]);
const uniqueId = ref('');

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tableName: undefined,
    tableComment: undefined,
  },
  preview: {
    open: false,
    title: proxy.$t('om.gen.code_preview'),
    data: {},
    activeName: 'domain.java',
  },
});

const { queryParams, preview } = toRefs(data);

onActivated(() => {
  const time = route.query.t;
  if (time != null && time != uniqueId.value) {
    uniqueId.value = time;
    queryParams.value.pageNum = Number(route.query.pageNum);
    dateRange.value = [];
    proxy.resetForm('queryForm');
    getList();
  }
});

/** 查询表集合 */
function getList() {
  loading.value = true;
  listTable(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    tableList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 生成代码操作 */
function handleGenTable(row) {
  const tbNames = row.tableName || tableNames.value;
  if (tbNames == '') {
    proxy.$modal.msgError(proxy.$t('om.gen.msg1'));
    return;
  }
  if (row.genType === '1') {
    genCode(row.tableName).then((response) => {
      proxy.$modal.msgSuccess(proxy.$t('om.gen.msg2', { field: row.genPath }));
    });
  } else {
    proxy.$download.zip('/tool/gen/batchGenCode?tables=' + tbNames, 'bit.zip');
  }
}
/** 同步数据库操作 */
function handleSynchDb(row) {
  const tableName = row.tableName;
  proxy.$modal
    .confirm(proxy.$t('om.gen.msg3', { field: tableName }))
    .then(function () {
      return synchDb(tableName);
    })
    .then(() => {
      proxy.$modal.msgSuccess(proxy.$t('om.sync') + proxy.$t('om.success'));
    })
    .catch(() => {});
}
/** 打开导入表弹窗 */
function openImportTable() {
  proxy.$refs['importRef'].show();
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm('queryRef');
  handleQuery();
}
/** 预览按钮 */
function handlePreview(row) {
  previewTable(row.tableId).then((response) => {
    preview.value.data = response.data;
    preview.value.open = true;
    preview.value.activeName = 'domain.java';
  });
}
/** 复制代码成功 */
function copyTextSuccess() {
  proxy.$modal.msgSuccess(proxy.$t('om.message.copy'));
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.tableId);
  tableNames.value = selection.map((item) => item.tableName);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 修改按钮操作 */
function handleEditTable(row) {
  const tableId = row.tableId || ids.value[0];
  router.push({ path: '/tool/gen-edit/index/' + tableId, query: { pageNum: queryParams.value.pageNum } });
}
/** 删除按钮操作 */
function handleDelete(row) {
  const tableIds = row.tableId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: tableIds }))
    .then(function () {
      return delTable(tableIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.message.delete'));
    })
    .catch(() => {});
}

getList();
</script>

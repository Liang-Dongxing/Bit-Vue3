<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="queryParams.tableName" placeholder="请输入表名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="queryParams.tableComment" placeholder="请输入表描述" clearable @keyup.enter="handleQuery" />
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
      <el-table-column label="序号" type="index" width="120" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="表名称" align="center" prop="tableName" :show-overflow-tooltip="true" />
      <el-table-column label="表描述" align="center" prop="tableComment" :show-overflow-tooltip="true" />
      <el-table-column label="实体" align="center" prop="className" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.creation_time')" align="center" prop="createTime" width="180" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180" />
      <el-table-column :label="$t('om.operation')" align="center" width="330" class-name="om-table-operation">
        <template #default="scope">
          <el-tooltip content="预览" placement="top">
            <el-button icon="View" @click="handlePreview(scope.row)" v-hasPermi="['tool:gen:preview']"></el-button>
          </el-tooltip>
          <el-tooltip content="编辑" placement="top">
            <el-button type="success" icon="Edit" @click="handleEditTable(scope.row)" v-hasPermi="['tool:gen:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.delete')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['tool:gen:remove']"></el-button>
          </el-tooltip>
          <el-tooltip content="同步" placement="top">
            <el-button icon="Refresh" @click="handleSynchDb(scope.row)" v-hasPermi="['tool:gen:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="生成代码" placement="top">
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
          <el-link :underline="false" icon="DocumentCopy" v-copyText="value" v-copyText:callback="copyTextSuccess" style="float: right">&nbsp;复制</el-link>
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
    title: '代码预览',
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
    proxy.$modal.msgError('请选择要生成的数据');
    return;
  }
  if (row.genType === '1') {
    genCode(row.tableName).then((response) => {
      proxy.$modal.msgSuccess('成功生成到自定义路径：' + row.genPath);
    });
  } else {
    proxy.$download.zip("/tool/gen/batchGenCode?tables=" + tbNames, "bit.zip");
  }
}
/** 同步数据库操作 */
function handleSynchDb(row) {
  const tableName = row.tableName;
  proxy.$modal
    .confirm('确认要强制同步"' + tableName + '"表结构吗？')
    .then(function () {
      return synchDb(tableName);
    })
    .then(() => {
      proxy.$modal.msgSuccess('同步成功');
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
  proxy.$modal.msgSuccess('复制成功');
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
    .confirm('是否确认删除表编号为"' + tableIds + '"的数据项？')
    .then(function () {
      return delTable(tableIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

getList();
</script>

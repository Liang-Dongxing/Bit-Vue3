<template>
  <!-- 导入表 -->
  <el-dialog :title="$t('om.gen.importTable.title')" v-model="visible" width="800px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" :label-position="settingsStore.labelPosition">
      <el-form-item :label="$t('om.gen.importTable.tableName')" prop="tableName">
        <el-input v-model="queryParams.tableName" :placeholder="$t('om.please_enter')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.gen.importTable.tableComment')" prop="tableComment">
        <el-input v-model="queryParams.tableComment" :placeholder="$t('om.please_enter')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="dbTableList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="tableName" :label="$t('om.gen.importTable.tableName')" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="tableComment" :label="$t('om.gen.importTable.tableComment')" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createTime" :label="$t('om.creation_time')"></el-table-column>
        <el-table-column prop="updateTime" :label="$t('om.update_time')"></el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleImportTable">{{ $t('om.save') }}</el-button>
        <el-button @click="visible = false">{{ $t('om.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { importTable, listDbTable } from '@/api/tool/gen';
import useSettingsStore from '@/store/modules/settings';

const total = ref(0);
const visible = ref(false);
const tables = ref([]);
const dbTableList = ref([]);
const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tableName: undefined,
  tableComment: undefined,
});

const emit = defineEmits(['ok']);

/** 查询参数列表 */
function show() {
  getList();
  visible.value = true;
}
/** 单击选择行 */
function clickRow(row) {
  proxy.$refs.table.toggleRowSelection(row);
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  tables.value = selection.map((item) => item.tableName);
}
/** 查询表数据 */
function getList() {
  listDbTable(queryParams).then((res) => {
    dbTableList.value = res.rows;
    total.value = res.total;
  });
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}
/** 导入按钮操作 */
function handleImportTable() {
  const tableNames = tables.value.join(',');
  if (tableNames == '') {
    proxy.$modal.msgError(proxy.$t('om.gen.importTable.msg1'));
    return;
  }
  importTable({ tables: tableNames }).then((res) => {
    proxy.$modal.msgSuccess(res.msg);
    if (res.code === 200) {
      visible.value = false;
      emit('ok');
    }
  });
}

defineExpose({
  show,
});
</script>

<template>
  <div class="om-app-container">
    <el-tabs v-model="activeName" class="om-table-header">
      <el-tab-pane :label="$t('om.gen.editTable.basic')" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane :label="$t('om.gen.editTable.columnInfo')" name="columnInfo">
        <el-table ref="dragTable" :data="columnsTableData" row-key="columnId">
          <el-table-column :label="$t('om.id')" type="index" min-width="5%" />
          <el-table-column :label="$t('om.gen.editTable.columnName')" prop="columnName" min-width="10%" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('om.gen.editTable.columnComment')" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.columnComment"></el-input>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.columnType')" prop="columnType" min-width="10%" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('om.gen.editTable.javaType')" min-width="11%">
            <template #default="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
                <el-option label="Boolean" value="Boolean" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.javaField')" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.javaField"></el-input>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.isInsert')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isInsert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.isEdit')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isEdit"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.isList')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isList"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.isQuery')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isQuery"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.queryType')" min-width="10%">
            <template #default="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GTE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LTE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.isRequired')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isRequired"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.htmlType')" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option :label="$t('om.gen.editTable.label1')" value="input" />
                <el-option :label="$t('om.gen.editTable.label2')" value="textarea" />
                <el-option :label="$t('om.gen.editTable.label3')" value="select" />
                <el-option :label="$t('om.gen.editTable.label4')" value="radio" />
                <el-option :label="$t('om.gen.editTable.label5')" value="checkbox" />
                <el-option :label="$t('om.gen.editTable.label6')" value="datetime" />
                <el-option :label="$t('om.gen.editTable.label7')" value="imageUpload" />
                <el-option :label="$t('om.gen.editTable.label8')" value="fileUpload" />
                <el-option :label="$t('om.gen.editTable.label9')" value="editor" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.gen.editTable.dictType')" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.dictType" clearable filterable :placeholder="$t('om.select')">
                <el-option v-for="dict in dictOptions" :key="dict.dictType" :label="dict.dictName" :value="dict.dictType">
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dictType }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('om.gen.editTable.genInfo')" name="genInfo">
        <gen-info-form ref="genInfo" :info="info" :tables="tables" />
      </el-tab-pane>
    </el-tabs>
    <div class="om-app-container-footer">
      <el-button type="primary" @click="submitForm()">{{ $t('om.save') }}</el-button>
      <el-button @click="close()">{{ $t('om.return') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="jsx" name="GenEdit">
import { getGenTable, updateGenTable } from '@/api/tool/gen';
import { optionselect as getDictOptionselect } from '@/api/system/dict/type';
import BasicInfoForm from '@/views/tool/gen/basicInfoForm';
import GenInfoForm from '@/views/tool/gen/genInfoForm';

const route = useRoute();
const { proxy } = getCurrentInstance();

const activeName = ref('columnInfo');
const tables = ref([]);
const columnsTableData = ref([]);
const dictOptions = ref([]);
const info = ref({});
let data = ref([
  { name: 'cat', value: '11' },
  { name: 'jerry', value: '112' },
  { name: 'spike', value: '111' },
  { name: 'kitty', value: '113' },
]);

/** 提交按钮 */
function submitForm() {
  const basicForm = proxy.$refs.basicInfo.$refs.basicInfoForm;
  const genForm = proxy.$refs.genInfo.$refs.genInfoForm;
  Promise.all([basicForm, genForm].map(getFormPromise)).then((res) => {
    const validateResult = res.every((item) => !!item);
    if (validateResult) {
      const genTable = Object.assign({}, info.value);
      genTable.columns = columnsTableData.value;
      genTable.params = {
        treeCode: info.value.treeCode,
        treeName: info.value.treeName,
        treeParentCode: info.value.treeParentCode,
        parentMenuId: info.value.parentMenuId,
      };
      updateGenTable(genTable).then((res) => {
        proxy.$modal.msgSuccess(res.msg);
        if (res.code === 200) {
          close();
        }
      });
    } else {
      proxy.$modal.msgError(proxy.$t('om.gen.editTable.msg1'));
    }
  });
}
function getFormPromise(form) {
  return new Promise((resolve) => {
    form.validate((res) => {
      resolve(res);
    });
  });
}
function close() {
  const obj = { path: '/tool/gen', query: { t: Date.now(), pageNum: route.query.pageNum } };
  proxy.$tab.closeOpenPage(obj);
}

(() => {
  const tableId = route.params && route.params.tableId;
  if (tableId) {
    // 获取表详细信息
    getGenTable(tableId).then((res) => {
      columnsTableData.value = res.data.rows;
      info.value = res.data.info;
      tables.value = res.data.tables;
    });
    /** 查询字典下拉列表 */
    getDictOptionselect().then((response) => {
      dictOptions.value = response.data;
    });
  }
})();
</script>

<template>
  <div class="om-app-container">
    <el-tabs v-model="activeName" class="om-table-header">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="columnInfo">
        <div :style="'height:' + tableHeight">
          <el-auto-resizer>
            <template #default="{ height, width }">
              <el-table-v2 :columns="table_v2_columns" :data="columnsTableData" :height="height" :width="width" fixed />
            </template>
          </el-auto-resizer>
        </div>
        <!--        <el-table ref="dragTable" :data="columnsTableData" row-key="columnId">-->
        <!--          <el-table-column :label="$t('om.id')" type="index" min-width="5%" />-->
        <!--          <el-table-column label="字段列名" prop="columnName" min-width="10%" :show-overflow-tooltip="true" />-->
        <!--          <el-table-column label="字段描述" min-width="10%">-->
        <!--            <template #default="scope">-->
        <!--              <el-input v-model="scope.row.columnComment"></el-input>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="物理类型" prop="columnType" min-width="10%" :show-overflow-tooltip="true" />-->
        <!--          <el-table-column label="Java类型" min-width="11%">-->
        <!--            <template #default="scope">-->
        <!--              <el-select v-model="scope.row.javaType">-->
        <!--                <el-option label="Long" value="Long" />-->
        <!--                <el-option label="String" value="String" />-->
        <!--                <el-option label="Integer" value="Integer" />-->
        <!--                <el-option label="Double" value="Double" />-->
        <!--                <el-option label="BigDecimal" value="BigDecimal" />-->
        <!--                <el-option label="Date" value="Date" />-->
        <!--                <el-option label="Boolean" value="Boolean" />-->
        <!--              </el-select>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="java属性" min-width="10%">-->
        <!--            <template #default="scope">-->
        <!--              <el-input v-model="scope.row.javaField"></el-input>-->
        <!--            </template>-->
        <!--          </el-table-column>-->

        <!--          <el-table-column label="插入" min-width="5%">-->
        <!--            <template #default="scope">-->
        <!--              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isInsert"></el-checkbox>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="编辑" min-width="5%">-->
        <!--            <template #default="scope">-->
        <!--              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isEdit"></el-checkbox>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="列表" min-width="5%">-->
        <!--            <template #default="scope">-->
        <!--              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isList"></el-checkbox>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="查询" min-width="5%">-->
        <!--            <template #default="scope">-->
        <!--              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isQuery"></el-checkbox>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="查询方式" min-width="10%">-->
        <!--            <template #default="scope">-->
        <!--              <el-select v-model="scope.row.queryType">-->
        <!--                <el-option label="=" value="EQ" />-->
        <!--                <el-option label="!=" value="NE" />-->
        <!--                <el-option label=">" value="GT" />-->
        <!--                <el-option label=">=" value="GTE" />-->
        <!--                <el-option label="<" value="LT" />-->
        <!--                <el-option label="<=" value="LTE" />-->
        <!--                <el-option label="LIKE" value="LIKE" />-->
        <!--                <el-option label="BETWEEN" value="BETWEEN" />-->
        <!--              </el-select>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="必填" min-width="5%">-->
        <!--            <template #default="scope">-->
        <!--              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isRequired"></el-checkbox>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="显示类型" min-width="12%">-->
        <!--            <template #default="scope">-->
        <!--              <el-select v-model="scope.row.htmlType">-->
        <!--                <el-option label="文本框" value="input" />-->
        <!--                <el-option label="文本域" value="textarea" />-->
        <!--                <el-option label="下拉框" value="select" />-->
        <!--                <el-option label="单选框" value="radio" />-->
        <!--                <el-option label="复选框" value="checkbox" />-->
        <!--                <el-option label="日期控件" value="datetime" />-->
        <!--                <el-option label="图片上传" value="imageUpload" />-->
        <!--                <el-option label="文件上传" value="fileUpload" />-->
        <!--                <el-option label="富文本控件" value="editor" />-->
        <!--              </el-select>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--          <el-table-column label="字典类型" min-width="12%">-->
        <!--            <template #default="scope">-->
        <!--              <el-select v-model="scope.row.dictType" clearable filterable :placeholder="$t('om.select')">-->
        <!--                <el-option v-for="dict in dictOptions" :key="dict.dictType" :label="dict.dictName" :value="dict.dictType">-->
        <!--                  <span style="float: left">{{ dict.dictName }}</span>-->
        <!--                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dictType }}</span>-->
        <!--                </el-option>-->
        <!--              </el-select>-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <!--        </el-table>-->
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="genInfo">
        <!--        <gen-info-form ref="genInfo" :info="info" :tables="tables" />-->
      </el-tab-pane>
    </el-tabs>
    <div class="om-app-container-footer">
      <el-button type="primary" @click="submitForm()">提交</el-button>
      <el-button @click="close()">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="jsx" name="GenEdit">
import { getGenTable, updateGenTable } from '@/api/tool/gen';
import { optionselect as getDictOptionselect } from '@/api/system/dict/type';
import useSettingsStore from '@/store/modules/settings';
import BasicInfoForm from '@/views/tool/gen/basicInfoForm';
import GenInfoForm from '@/views/tool/gen/genInfoForm';

const route = useRoute();
const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const activeName = ref('columnInfo');
const tableHeight = ref(document.documentElement.scrollHeight - 260 + 'px');
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
      proxy.$modal.msgError('表单校验未通过，请重新检查提交内容');
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

const table_v2_columns = [
  {
    key: 'index',
    dataKey: 'index',
    title: 'ID',
    width: 30,
    align: 'center',
    cellRenderer: ({ rowIndex }) => `${rowIndex + 1}`,
  },
  {
    key: 'columnName',
    dataKey: 'columnName',
    title: '字段列名',
    width: 150,
    align: 'center',
  },
  {
    key: 'columnComment',
    dataKey: 'columnComment',
    title: '字段描述',
    width: 150,
    align: 'center',
    cellRenderer: ({ cellData }) => <el-input v-model={cellData} />,
  },
  {
    key: 'columnType',
    dataKey: 'columnType',
    title: '物理类型',
    width: 100,
    align: 'center',
  },
  {
    key: 'javaType',
    dataKey: 'javaType',
    title: 'Java类型',
    width: 150,
    align: 'center',
    cellRenderer: ({ cellData }) => (
      <el-select v-model={cellData}>
        <el-option label='Long' value='Long' />
        <el-option label='String' value='String' />
        <el-option label='Integer' value='Integer' />
        <el-option label='Double' value='Double' />
        <el-option label='BigDecimal' value='BigDecimal' />
        <el-option label='Date' value='Date' />
        <el-option label='Boolean' value='Boolean' />
      </el-select>
    ),
  },
  {
    key: 'javaField',
    dataKey: 'javaField',
    title: 'Java属性',
    width: 150,
    align: 'center',
    cellRenderer: ({ cellData }) => <el-input v-model={cellData} />,
  },
  {
    key: 'isInsert',
    dataKey: 'isInsert',
    title: '插入',
    width: 50,
    align: 'center',
    cellRenderer: ({ cellData }) => <el-checkbox true-label='1' false-label='0' v-model={cellData}></el-checkbox>,
  },
  {
    key: 'isEdit',
    dataKey: 'isEdit',
    title: '编辑',
    width: 50,
    align: 'center',
    cellRenderer: ({ cellData }) => <el-checkbox true-label='1' false-label='0' v-model={cellData}></el-checkbox>,
  },
  {
    key: 'isList',
    dataKey: 'isList',
    title: '列表',
    width: 50,
    align: 'center',
    cellRenderer: ({ cellData }) => <el-checkbox true-label='1' false-label='0' v-model={cellData}></el-checkbox>,
  },
  {
    key: 'isQuery',
    dataKey: 'isQuery',
    title: '查询',
    width: 50,
    align: 'center',
    cellRenderer: ({ cellData }) => <el-checkbox true-label='1' false-label='0' v-model={cellData}></el-checkbox>,
  },
  {
    key: 'queryType',
    dataKey: 'queryType',
    title: '查询方式',
    width: 150,
    align: 'center',
    cellRenderer: ({ cellData }) => (
      <el-select v-model={cellData}>
        <el-option label='=' value='EQ' />
        <el-option label='!=' value='NE' />
        <el-option label='>' value='GT' />
        <el-option label='>=' value='GTE' />
        <el-option label='<' value='LT' />
        <el-option label='<=' value='LTE' />
        <el-option label='LIKE' value='LIKE' />
        <el-option label='BETWEEN' value='BETWEEN' />
      </el-select>
    ),
  },
  {
    key: 'isRequired',
    dataKey: 'isRequired',
    title: '必填',
    width: 50,
    align: 'center',
    cellRenderer: ({ cellData }) => <el-checkbox true-label='1' false-label='0' v-model={cellData}></el-checkbox>,
  },
  {
    key: 'htmlType',
    dataKey: 'htmlType',
    title: '显示类型',
    width: 150,
    align: 'center',
    cellRenderer: ({ cellData }) => (
      <el-select v-model={cellData}>
        <el-option label='文本框' value='input' />
        <el-option label='文本域' value='textarea' />
        <el-option label='下拉框' value='select' />
        <el-option label='单选框' value='radio' />
        <el-option label='复选框' value='checkbox' />
        <el-option label='日期控件' value='datetime' />
        <el-option label='图片上传' value='imageUpload' />
        <el-option label='文件上传' value='fileUpload' />
        <el-option label='富文本控件' value='editor' />
      </el-select>
    ),
  },
  {
    key: 'dictType',
    dataKey: 'dictType',
    title: '字典类型',
    width: 150,
    align: 'center',
    cellRenderer: ({ cellData }) => (
      <el-select v-model={cellData}>
        {dictOptions.value.map((item, index) => (
          <el-option label={item.dictName} value={item.dictType}>
            <span style='float: left'>{item.dictName}</span>
            <span style='float: right; color: #8492a6; font-size: 13px'>{item.dictType}</span>
          </el-option>
        ))}
      </el-select>
    ),
  },
];
</script>

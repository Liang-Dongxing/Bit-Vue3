<template>
  <div class="om-app-container">
    <el-form class="om-table-header" :model="queryParams" :label-position="settingsStore.labelPosition" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item :label="$t('om.ddns.hostRecord')" prop="hostRecord">
        <el-input v-model="queryParams.hostRecord" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.ddns.parseRecordType')" prop="parseRecordType">
        <el-select v-model="queryParams.parseRecordType" :placeholder="$t('om.select')" clearable>
          <el-option v-for="dict in parse_record_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['ops:ddns:add']">{{ $t('om.add') }}</el-button>
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['ops:ddns:edit']">{{ $t('om.edit') }}</el-button>
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['ops:ddns:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['ops:ddns:export']">{{ $t('om.export') }}</el-button>
        <el-button type="primary" plain icon="Link">
          <router-link to="/tool/ak" class="router-link">{{ $t('om.ak_configuration') }}</router-link>
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ddnsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ddns ID" align="center" prop="ddnsId" />
      <el-table-column :label="$t('om.ddns.hostRecord')" align="center" prop="hostRecord" />
      <el-table-column :label="$t('om.ddns.domain')" align="center" prop="domain" />
      <el-table-column :label="$t('om.ddns.parseRecordType')" align="center" prop="parseRecordType">
        <template #default="scope">
          <dict-tag :options="parse_record_type" :value="scope.row.parseRecordType" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.ddns.recordTheValue')" align="center" prop="recordTheValue" />
      <el-table-column label="Access ID" align="center" prop="accessId" />
      <el-table-column :label="$t('om.remarks')" align="center" prop="remark" />
      <el-table-column :label="$t('om.operation')" align="center" class-name="om-table-operation">
        <template #default="scope">
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ops:ddns:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.delete')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ops:ddns:remove']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改ddns 解析配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="ddnsRef" :model="form" :rules="rules" :label-position="settingsStore.labelPosition" label-width="120px">
        <el-form-item :label="$t('om.ddns.hostRecord')" prop="hostRecord">
          <el-input v-model="form.hostRecord" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.ddns.domain')" prop="domain">
          <el-input v-model="form.domain" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.ddns.parseRecordType')" prop="parseRecordType">
          <el-select v-model="form.parseRecordType" :placeholder="$t('om.select')">
            <el-option v-for="dict in parse_record_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Access ID" prop="accessId">
          <el-select v-model="form.accessId" :placeholder="$t('om.select')">
            <el-option v-for="access in accessList" :key="access.accessId" :label="access.accessId" :value="access.accessId">
              <span class="accessList">{{ access.accessId }}</span>
              <span class="accessList">{{ access.accessKeyId }}</span>
              <span class="accessList">
                <dict-tag :options="access_key_type" :value="access.accessKeyType" />
              </span>
            </el-option>
          </el-select>
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

<script setup name="Ddns">
import { listDdns, getDdns, delDdns, addDdns, updateDdns } from '@/api/ops/ddns';
import { listAccess } from '@/api/ops/access';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { parse_record_type, access_key_type } = proxy.useDict('parse_record_type', 'access_key_type');

const ddnsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const accessList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    domain: null,
    hostRecord: null,
    parseRecordType: null,
    accessId: null,
  },
  rules: {
    domain: [{ required: true, message: proxy.$t('om.ddns.rules1'), trigger: 'blur' }],
    hostRecord: [{ required: true, message: proxy.$t('om.ddns.rules2'), trigger: 'blur' }],
    parseRecordType: [{ required: true, message: proxy.$t('om.ddns.rules3'), trigger: 'change' }],
    accessId: [{ required: true, message: proxy.$t('om.ddns.rules4'), trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询ddns 解析配置列表 */
function getList() {
  loading.value = true;
  listDdns(queryParams.value).then((response) => {
    ddnsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 查询第三方AccessKey列表 */
function getAccessKeyList() {
  listAccess().then((response) => {
    accessList.value = response.rows;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    ddnsId: null,
    domain: null,
    hostRecord: null,
    parseRecordType: null,
    accessId: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
  };
  proxy.resetForm('ddnsRef');
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
  ids.value = selection.map((item) => item.ddnsId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = proxy.$t('om.ddns.add');
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _ddnsId = row.ddnsId || ids.value;
  getDdns(_ddnsId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = proxy.$t('om.ddns.edit');
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['ddnsRef'].validate((valid) => {
    if (valid) {
      if (form.value.ddnsId != null) {
        updateDdns(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
          open.value = false;
          getList();
        });
      } else {
        addDdns(form.value).then((response) => {
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
  const _ddnsIds = row.ddnsId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: _ddnsIds }))
    .then(function () {
      return delDdns(_ddnsIds);
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
    'ops/ddns/export',
    {
      ...queryParams.value,
    },
    `ddns_${new Date().getTime()}.xlsx`,
  );
}

getList();
getAccessKeyList();
</script>
<style lang="scss" scoped>
::v-deep(.accessList) {
  margin-right: 10px;

  div {
    display: inline;
  }
}
</style>

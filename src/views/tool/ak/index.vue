<template>
  <div class="om-app-container">
    <el-form class="om-table-header" :model="queryParams" :label-position="settingsStore.labelPosition" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="AccessKey ID" prop="accessKeyId">
        <el-input v-model="queryParams.accessKeyId" :placeholder="$t('om.please_enter')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.ak.accessKeyType')" prop="accessKeyType">
        <el-select v-model="queryParams.accessKeyType" :placeholder="$t('om.select')" clearable>
          <el-option v-for="dict in access_key_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['ops:ak:add']">{{ $t('om.add') }}</el-button>
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['ops:ak:edit']">{{ $t('om.edit') }}</el-button>
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['ops:ak:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['ops:ak:export']">{{ $t('om.export') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="accessList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Access ID" align="center" prop="accessId" width="100" />
      <el-table-column label="AccessKey ID" align="center" prop="accessKeyId" width="300" />
      <el-table-column label="AccessKey Secret" align="center" prop="accessKeySecret" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.ak.accessKeyType')" align="center" prop="accessKeyType" width="160">
        <template #default="scope">
          <dict-tag :options="access_key_type" :value="scope.row.accessKeyType" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation')" align="center" class-name="om-table-operation" width="140">
        <template #default="scope">
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ops:ak:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.delete')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ops:ak:remove']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改第三方AccessKey管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="accessRef" :model="form" :rules="rules" :label-position="settingsStore.labelPosition" label-width="160px">
        <el-form-item label="AccessKey ID" prop="accessKeyId">
          <el-input v-model="form.accessKeyId" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item label="AccessKey Secret" prop="accessKeySecret">
          <el-input v-model="form.accessKeySecret" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.ak.accessKeyType')" prop="accessKeyType">
          <el-select v-model="form.accessKeyType" :placeholder="$t('om.select')">
            <el-option v-for="dict in access_key_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
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

<script setup name="Access">
import { listAccess, getAccess, delAccess, addAccess, updateAccess } from '@/api/ops/access';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { access_key_type } = proxy.useDict('access_key_type');

const accessList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    accessKeyId: null,
    accessKeyType: null,
  },
  rules: {
    accessKeySecret: [{ required: true, message: proxy.$t('om.ak.rules1'), trigger: 'blur' }],
    accessKeyId: [{ required: true, message: proxy.$t('om.ak.rules2'), trigger: 'blur' }],
    accessKeyType: [{ required: true, message: proxy.$t('om.ak.rules3'), trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询第三方AccessKey管理列表 */
function getList() {
  loading.value = true;
  listAccess(queryParams.value).then((response) => {
    accessList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
    accessId: null,
    accessKeySecret: null,
    accessKeyId: null,
    accessKeyType: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
  };
  proxy.resetForm('accessRef');
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
  ids.value = selection.map((item) => item.accessId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = proxy.$t('om.ak.add');
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _accessId = row.accessId || ids.value;
  getAccess(_accessId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = proxy.$t('om.ak.edit');
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['accessRef'].validate((valid) => {
    if (valid) {
      if (form.value.accessId != null) {
        updateAccess(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
          open.value = false;
          getList();
        });
      } else {
        addAccess(form.value).then((response) => {
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
  const _accessIds = row.accessId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: _accessIds }))
    .then(function () {
      return delAccess(_accessIds);
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
    'ops/access/export',
    {
      ...queryParams.value,
    },
    `access_${new Date().getTime()}.xlsx`,
  );
}

getList();
</script>

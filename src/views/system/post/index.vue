<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.post.code')" prop="postCode">
        <el-input v-model="queryParams.postCode" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.post.name')" prop="postName">
        <el-input v-model="queryParams.postName" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('om.select')" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:post:add']">{{ $t('om.add') }}</el-button>
        <el-button type="success" icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:post:edit']">{{ $t('om.edit') }}</el-button>
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:post:remove']">{{ $t('om.delete') }}</el-button>
        <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['system:post:export']">{{ $t('om.export') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('om.id')" align="center" prop="postId" width="120" />
      <el-table-column :label="$t('om.post.code')" align="center" prop="postCode" />
      <el-table-column :label="$t('om.post.name')" align="center" prop="postName" />
      <el-table-column :label="$t('om.sort')" align="center" prop="postSort" width="120" />
      <el-table-column :label="$t('om.status')" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.creation_time')" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation')" align="center" class-name="om-table-operation" width="150">
        <template #default="scope">
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:post:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:post:remove']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="postRef" :model="form" :rules="rules" :label-position="settingsStore.labelPosition" label-width="80px">
        <el-form-item :label="$t('om.post.name')" prop="postName">
          <el-input v-model="form.postName" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.post.code')" prop="postCode">
          <el-input v-model="form.postCode" :placeholder="$t('om.please_enter')" />
        </el-form-item>
        <el-form-item :label="$t('om.sort')" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('om.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
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

<script setup name="Post">
import { addPost, delPost, getPost, listPost, updatePost } from '@/api/system/post';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const postList = ref([]);
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
    postCode: undefined,
    postName: undefined,
    status: undefined,
  },
  rules: {
    postName: [{ required: true, message: proxy.$t('om.post.rules1'), trigger: 'blur' }],
    postCode: [{ required: true, message: proxy.$t('om.post.rules2'), trigger: 'blur' }],
    postSort: [{ required: true, message: proxy.$t('om.post.rules3'), trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询岗位列表 */
function getList() {
  loading.value = true;
  listPost(queryParams.value).then((response) => {
    postList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: '0',
    remark: undefined,
  };
  proxy.resetForm('postRef');
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
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.postId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = proxy.$t('om.post.add');
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const postId = row.postId || ids.value;
  getPost(postId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = proxy.$t('om.post.edit');
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['postRef'].validate((valid) => {
    if (valid) {
      if (form.value.postId != undefined) {
        updatePost(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
          open.value = false;
          getList();
        });
      } else {
        addPost(form.value).then((response) => {
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
  const postIds = row.postId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: postIds }))
    .then(function () {
      return delPost(postIds);
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
    'system/post/export',
    {
      ...queryParams.value,
    },
    `post_${new Date().getTime()}.xlsx`,
  );
}

getList();
</script>

<template>
  <div class="om-app-container">
    <el-row>
      <!--部门数据-->
      <el-col :span="4" :md="24" :lg="6" :xl="4" class="dept-tree hidden-xs-only hidden-sm-only">
        <div class="head-container">
          <el-input v-model="deptName" :placeholder="$t('om.please_enter')" clearable prefix-icon="Search" style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="deptOptions" :props="{ label: 'label', children: 'children' }" :expand-on-click-node="false" :filter-node-method="filterNode" ref="deptTreeRef" node-key="id" highlight-current default-expand-all @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24" :sm="24" :md="24" :lg="18" :xl="20">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header">
          <el-form-item :label="$t('om.user.name')" prop="userName">
            <el-input v-model="queryParams.userName" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('om.user.mobile')" prop="phonenumber">
            <el-input v-model="queryParams.phonenumber" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('om.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="$t('om.select')" clearable>
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('om.creation_time')">
            <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" :start-placeholder="$t('om.start_date')" :end-placeholder="$t('om.end_date')"></el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('om.operation')">
            <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
          </el-form-item>
        </el-form>

        <el-row justify="space-between" class="om-table-header">
          <el-col :span="21" :xs="24" :sm="19" :md="19" :lg="18" :xl="21">
            <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:user:add']">{{ $t('om.add') }}</el-button>
            <el-button type="success" icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:user:edit']">{{ $t('om.edit') }}</el-button>
            <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:user:remove']">{{ $t('om.delete') }}</el-button>
            <el-button type="info" icon="Upload" @click="handleImport" v-hasPermi="['system:user:import']">
              {{ $t('om.import') }}
            </el-button>
            <el-button type="warning" icon="Download" @click="handleExport" v-hasPermi="['system:user:export']">
              {{ $t('om.export') }}
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column :label="$t('om.id')" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
          <el-table-column :label="$t('om.user.name')" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('om.user.nickname')" align="center" key="nickName" prop="nickName" v-if="columns[2].visible" :show-overflow-tooltip="true" width="130" />
          <el-table-column :label="$t('om.user.department')" align="center" key="deptName" prop="dept.deptName" v-if="columns[3].visible" :show-overflow-tooltip="true" width="110" />
          <el-table-column :label="$t('om.user.mobile')" align="center" key="phonenumber" prop="phonenumber" v-if="columns[4].visible" width="110" />
          <el-table-column :label="$t('om.status')" align="center" key="status" v-if="columns[5].visible">
            <template #default="scope">
              <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.creation_time')" align="center" prop="createTime" v-if="columns[6].visible" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('om.operation')" align="center" width="150" class-name="om-table-operation">
            <template #default="scope">
              <el-tooltip :content="$t('om.edit')" placement="top" v-if="scope.row.userId !== 1">
                <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
              </el-tooltip>
              <el-tooltip :content="$t('om.delete')" placement="top" v-if="scope.row.userId !== 1">
                <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
              </el-tooltip>
              <el-tooltip :content="$t('om.reset_password')" placement="top" v-if="scope.row.userId !== 1">
                <el-button icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
              </el-tooltip>
              <el-tooltip :content="$t('om.assign_roles')" placement="top" v-if="scope.row.userId !== 1">
                <el-button icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form :model="form" :rules="rules" ref="userRef" :label-position="settingsStore.labelPosition" label-width="160px">
        <el-form-item :label="$t('om.user.nickname')" prop="nickName">
          <el-input v-model="form.nickName" :placeholder="$t('om.please_enter')" maxlength="30" />
        </el-form-item>
        <el-form-item :label="$t('om.user.department')" prop="deptId">
          <el-tree-select v-model="form.deptId" :data="deptOptions" :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" :placeholder="$t('om.select')" check-strictly />
        </el-form-item>
        <el-form-item :label="$t('om.user.mobile')" prop="phonenumber">
          <el-input v-model="form.phonenumber" :placeholder="$t('om.please_enter')" maxlength="11" />
        </el-form-item>
        <el-form-item :label="$t('om.user.email')" prop="email">
          <el-input v-model="form.email" :placeholder="$t('om.please_enter')" maxlength="50" />
        </el-form-item>
        <el-form-item v-if="form.userId === undefined" :label="$t('om.user.name')" prop="userName">
          <el-input v-model="form.userName" :placeholder="$t('om.please_enter')" maxlength="30" />
        </el-form-item>
        <el-form-item v-if="form.userId === undefined" :label="$t('om.user.password')" prop="password">
          <el-input v-model="form.password" :placeholder="$t('om.please_enter')" type="password" maxlength="20" show-password />
        </el-form-item>
        <el-form-item :label="$t('om.user.gender')">
          <el-select v-model="form.sex" :placeholder="$t('om.select')">
            <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('om.status')">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('om.user.position')">
          <el-select v-model="form.postIds" multiple :placeholder="$t('om.select')">
            <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId" :disabled="item.status == 1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('om.user.role')">
          <el-select v-model="form.roleIds" multiple :placeholder="$t('om.select')">
            <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId" :disabled="item.status == 1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('om.remarks')">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('om.please_enter')"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ $t('om.save') }}</el-button>
          <el-button @click="cancel">{{ $t('om.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers" :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading" :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">
          {{ $t('om.user.msg8') }}
          <em>{{ $t('om.user.msg10') }}</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />
              {{ $t('om.user.msg6') }}
            </div>
            <span>{{ $t('om.user.msg7') }}</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">{{ $t('om.user.msg9') }}</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">{{ $t('om.save') }}</el-button>
          <el-button @click="upload.open = false">{{ $t('om.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
    <!--  分配角色  -->
    <auth-role ref="AuthRoleRef" />
  </div>
</template>

<script setup name="User">
import { getToken } from '@/utils/auth';
import { addUser, changeUserStatus, delUser, deptTreeSelect, getUser, listUser, resetUserPwd, updateUser } from '@/api/system/user';
import AuthRole from '@/views/system/user/authRole';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_normal_disable, sys_user_sex } = proxy.useDict('sys_normal_disable', 'sys_user_sex');

const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const dateRange = ref([]);
const deptName = ref('');
const deptOptions = ref(undefined);
const initPassword = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);
const AuthRoleRef = ref();
const tableRef = ref();
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: 'Bearer ' + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/system/user/importData',
});
// 列显隐信息
const columns = ref([
  { key: 0, label: proxy.$t('om.id'), visible: true },
  { key: 1, label: proxy.$t('om.user.name'), visible: true },
  { key: 2, label: proxy.$t('om.user.nickname'), visible: true },
  { key: 3, label: proxy.$t('om.user.department'), visible: true },
  { key: 4, label: proxy.$t('om.user.mobile'), visible: true },
  { key: 5, label: proxy.$t('om.status'), visible: true },
  { key: 6, label: proxy.$t('om.creation_time'), visible: true },
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined,
  },
  rules: {
    userName: [
      { required: true, message: proxy.$t('om.user.rules1'), trigger: 'blur' },
      { min: 2, max: 20, message: proxy.$t('om.user.rules2'), trigger: 'blur' },
    ],
    nickName: [{ required: true, message: proxy.$t('om.user.rules3'), trigger: 'blur' }],
    password: [
      { required: true, message: proxy.$t('om.user.rules4'), trigger: 'blur' },
      { min: 5, max: 20, message: proxy.$t('om.user.rules5'), trigger: 'blur' },
    ],
    email: [{ type: 'email', message: proxy.$t('om.user.rules6'), trigger: ['blur', 'change'] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: proxy.$t('om.user.rules7'), trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
/** 根据名称筛选部门树 */
watch(deptName, (val) => {
  proxy.$refs['deptTreeRef'].filter(val);
});

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data;
  });
}

/** 查询用户列表 */
function getList() {
  loading.value = true;
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false;
    userList.value = res.rows;
    total.value = res.total;
  });
}

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id;
  handleQuery();
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
  queryParams.value.deptId = undefined;
  proxy.$refs.tree.setCurrentKey(null);
  handleQuery();
}

/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: userIds }))
    .then(function () {
      return delUser(ruserIds);
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
    'system/user/export',
    {
      ...queryParams.value,
    },
    `user_${new Date().getTime()}.xlsx`,
  );
}

/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.status === '0' ? proxy.$t('om.enabled') : proxy.$t('om.deactivation');
  proxy.$modal
    .confirm(proxy.$t('om.user.msg1', { field1: text, field2: row.userName }))
    .then(function () {
      return changeUserStatus(row.userId, row.status);
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + proxy.$t('om.success'));
    })
    .catch(function () {
      row.status = row.status === '0' ? '1' : '0';
    });
}

/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case 'handleResetPwd':
      handleResetPwd(row);
      break;
    case 'handleAuthRole':
      handleAuthRole(row);
      break;
    default:
      break;
  }
}

/** 跳转角色分配 */
const handleAuthRole = (row) => {
  const userId = row.userId;
  AuthRoleRef.value.show(userId);
};

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy
    .$prompt(proxy.$t('om.user.msg2', { field1: row.userName }), proxy.$t('om.hint'), {
      confirmButtonText: proxy.$t('om.save'),
      cancelButtonText: proxy.$t('om.cancel'),
      closeOnClickModal: false,
      inputPattern: /^.{5,20}$/,
      inputErrorMessage: proxy.$t('om.user.rules5'),
    })
    .then(({ value }) => {
      resetUserPwd(row.userId, value).then((response) => {
        proxy.$modal.msgSuccess(proxy.$t('om.user.msg3', { field: value }));
      });
    })
    .catch(() => {});
}

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 导入按钮操作 */
function handleImport() {
  upload.title = proxy.$t('om.user.import');
  upload.open = true;
}

/** 下载模板操作 */
function importTemplate() {
  proxy.download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`);
}

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs['uploadRef'].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', proxy.$t('om.user.msg4'), { dangerouslyUseHTMLString: true });
  getList();
};

/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs['uploadRef'].submit();
}

/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: [],
  };
  proxy.resetForm('userRef');
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  getUser().then((response) => {
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    open.value = true;
    title.value = proxy.$t('om.user.add');
    form.value.password = initPassword.value;
  });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const userId = row.userId || ids.value;
  getUser(userId).then((response) => {
    form.value = response.data;
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    form.value.postIds = response.postIds;
    form.value.roleIds = response.roleIds;
    open.value = true;
    title.value = proxy.$t('om.user.edit');
    form.password = '';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['userRef'].validate((valid) => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.success'));
          open.value = false;
          getList();
        });
      } else {
        addUser(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.success'));
          open.value = false;
          getList();
        });
      }
    }
  });
}

getDeptTree();
getList();
</script>

<style lang="scss" scoped>
.om-app-container {
  .dept-tree {
    padding: 13px 30px 13px 30px !important;
    background-color: var(--el-bg-color);
  }
}
</style>

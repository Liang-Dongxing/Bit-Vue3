<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :label-position="settingsStore.labelPosition" :inline="true" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.user.name')" prop="userName">
        <el-input v-model="queryParams.userName" :placeholder="$t('om.please_enter')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.user.mobile')" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" :placeholder="$t('om.please_enter')" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="primary" icon="Plus" @click="openSelectUser" v-hasPermi="['system:role:add']">{{ $t('om.user.add') }}</el-button>
        <el-button type="danger" icon="CircleClose" :disabled="multiple" @click="cancelAuthUserAll" v-hasPermi="['system:role:remove']">{{ $t('om.role.permissions4') }}</el-button>
        <el-button type="warning" icon="Close" @click="handleClose">{{ $t('om.close') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('om.user.name')" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.user.nickname')" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.user.email')" prop="email" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.user.mobile')" prop="phonenumber" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.status')" align="center" prop="status">
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
          <el-button type="danger" icon="CircleClose" @click="cancelAuthUser(scope.row)" v-hasPermi="['system:role:remove']">{{ $t('om.role.permissions5') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <select-user ref="selectRef" :role-id="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>

<script setup name="AuthUser">
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role';
import useSettingsStore from '@/store/modules/settings';
import SelectUser from '@/views/system/role/selectUser';

const route = useRoute();
const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const userList = ref([]);
const loading = ref(true);
const showSearch = ref(false);
const multiple = ref(true);
const total = ref(0);
const userIds = ref([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: route.params.roleId,
  userName: undefined,
  phonenumber: undefined,
});

/** 查询授权用户列表 */
function getList() {
  loading.value = true;
  allocatedUserList(queryParams).then((response) => {
    userList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 返回按钮
function handleClose() {
  const obj = { path: '/system/role' };
  proxy.$tab.closeOpenPage(obj);
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
// 多选框选中数据
function handleSelectionChange(selection) {
  userIds.value = selection.map((item) => item.userId);
  multiple.value = !selection.length;
}
/** 打开授权用户表弹窗 */
function openSelectUser() {
  proxy.$refs['selectRef'].show();
}
/** 取消授权按钮操作 */
function cancelAuthUser(row) {
  proxy.$modal
    .confirm(proxy.$t('om.role.msg5', { field1: row.userName }))
    .then(function () {
      return authUserCancel({ userId: row.userId, roleId: queryParams.roleId });
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.role.msg3'));
    })
    .catch(() => {});
}
/** 批量取消授权按钮操作 */
function cancelAuthUserAll(row) {
  const roleId = queryParams.roleId;
  const uIds = userIds.value.join(',');
  proxy.$modal
    .confirm(proxy.$t('om.role.msg4'))
    .then(function () {
      return authUserCancelAll({ roleId: roleId, userIds: uIds });
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.role.msg3'));
    })
    .catch(() => {});
}

getList();
</script>

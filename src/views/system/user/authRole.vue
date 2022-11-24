<template>
  <el-dialog :title="$t('om.assign_roles')" v-model="open" :destroy-on-close="true" :draggable="true">
    <template #default>
      <el-form :model="form" :label-position="settingsStore.labelPosition" label-width="80px">
        <el-form-item :label="$t('om.user.nickname')" prop="nickName">
          <el-input v-model="form.nickName" disabled />
        </el-form-item>
        <el-form-item :label="$t('om.user.name')" prop="userName">
          <el-input v-model="form.userName" disabled />
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :row-key="getRowKey" @row-click="clickRow" ref="roleRef" @selection-change="handleSelectionChange" :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)">
        <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
        <el-table-column :label="$t('om.id')" align="center" prop="roleId" />
        <el-table-column :label="$t('om.role.name')" align="center" prop="roleName" />
        <el-table-column :label="$t('om.role.key')" align="center" prop="roleKey" />
        <el-table-column :label="$t('om.creation_time')" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm()">{{ $t('om.save') }}</el-button>
        <el-button @click="close()">{{ $t('om.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="AuthRole">
import { getAuthRole, updateAuthRole } from '@/api/system/user';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const loading = ref(true);
const open = ref(false);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const roleIds = ref([]);
const roles = ref([]);
const form = ref({
  nickName: undefined,
  userName: undefined,
  userId: undefined,
});

/** 单击选中行数据 */
function clickRow(row) {
  proxy.$refs['roleRef'].toggleRowSelection(row);
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  roleIds.value = selection.map((item) => item.roleId);
}

/** 保存选中的数据编号 */
function getRowKey(row) {
  return row.roleId;
}

function show(userId) {
  open.value = true;
  getList(userId);
}

/** 关闭按钮 */
function close() {
  open.value = false;
  form.value = {};
  roles.value = [];
  roleIds.value = [];
  total.value = 0;
}

/** 提交按钮 */
function submitForm() {
  const userId = form.value.userId;
  const rIds = roleIds.value.join(',');
  updateAuthRole({ userId: userId, roleIds: rIds }).then((response) => {
    proxy.$modal.msgSuccess(proxy.$t('om.message.authorization'));
    close();
  });
}

function getList(userId) {
  if (userId) {
    loading.value = true;
    getAuthRole(userId).then((response) => {
      form.value = response.user;
      roles.value = response.roles;
      total.value = roles.value.length;
      nextTick(() => {
        roles.value.forEach((row) => {
          if (row.flag) {
            proxy.$refs['roleRef'].toggleRowSelection(row);
          }
        });
      });
      loading.value = false;
    });
  }
}

defineExpose({ show });
</script>

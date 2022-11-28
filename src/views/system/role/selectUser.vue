<template>
  <!-- 授权用户 -->
  <el-dialog :title="$t('om.role.select_user')" v-model="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" :label-position="settingsStore.labelPosition" ref="queryRef" :inline="true">
      <el-form-item :label="$t('om.user.name')" prop="userName">
        <el-input v-model="queryParams.userName" :placeholder="$t('om.please_enter')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.user.mobile')" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" :placeholder="$t('om.please_enter')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="refTable" :data="userList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('om.user.name')" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('om.user.nickname')" prop="nickName" :show-overflow-tooltip="true" width="130" />
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
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSelectUser">{{ $t('om.save') }}</el-button>
        <el-button @click="visible = false">{{ $t('om.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="SelectUser">
import { authUserSelectAll, unallocatedUserList } from '@/api/system/role';
import useSettingsStore from '@/store/modules/settings';

const settingsStore = useSettingsStore();
const props = defineProps({
  roleId: {
    type: [Number, String],
  },
});

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const userList = ref([]);
const visible = ref(false);
const total = ref(0);
const userIds = ref([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined,
});

// 显示弹框
function show() {
  queryParams.roleId = props.roleId;
  getList();
  visible.value = true;
}
/**选择行 */
function clickRow(row) {
  proxy.$refs['refTable'].toggleRowSelection(row);
}
// 多选框选中数据
function handleSelectionChange(selection) {
  userIds.value = selection.map((item) => item.userId);
}
// 查询表数据
function getList() {
  unallocatedUserList(queryParams).then((res) => {
    userList.value = res.rows;
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
const emit = defineEmits(['ok']);
/** 选择授权用户操作 */
function handleSelectUser() {
  const roleId = queryParams.roleId;
  const uIds = userIds.value.join(',');
  if (uIds == '') {
    proxy.$modal.msgError(proxy.$t('om.role.msg6'));
    return;
  }
  authUserSelectAll({ roleId: roleId, userIds: uIds }).then((res) => {
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

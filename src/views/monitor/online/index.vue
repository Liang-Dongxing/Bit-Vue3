<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.online.ipaddr')" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.user.name')" prop="userName">
        <el-input v-model="queryParams.userName" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21"></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="onlineList.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%">
      <el-table-column :label="$t('om.id')" width="120" type="index" align="center">
        <template #default="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.id')" align="center" prop="tokenId" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.online.userName')" align="center" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.online.deptName')" align="center" prop="deptName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.online.ipaddr')" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.online.loginLocation')" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.online.os')" align="center" prop="os" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.online.browser')" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('om.online.loginTime')" align="center" prop="loginTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation')" align="center" class-name="om-table-operation" width="150">
        <template #default="scope">
          <el-tooltip :content="$t('om.strong_retreat')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleForceLogout(scope.row)" v-hasPermi="['monitor:online:forceLogout']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
  </div>
</template>

<script setup name="Online">
import { forceLogout, list as initData } from '@/api/monitor/online';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const onlineList = ref([]);
const loading = ref(true);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const showSearch = ref(false);

const queryParams = ref({
  ipaddr: undefined,
  userName: undefined,
});

/** 查询登录日志列表 */
function getList() {
  loading.value = true;
  initData(queryParams.value).then((response) => {
    onlineList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 搜索按钮操作 */
function handleQuery() {
  pageNum.value = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}
/** 强退按钮操作 */
function handleForceLogout(row) {
  proxy.$modal
    .confirm(proxy.$t('om.online.msg1', { field: row.userName }))
    .then(function () {
      return forceLogout(row.tokenId);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.message.delete'));
    })
    .catch(() => {});
}

getList();
</script>

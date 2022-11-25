<template>
  <div class="om-app-container">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ $t('om.cache.list.header1') }}</span>
              <el-button icon="Refresh" @click="refreshCacheNames()"></el-button>
            </div>
          </template>
          <el-table v-loading="loading" :data="cacheNames" :height="tableHeight" highlight-current-row @row-click="getCacheKeys" style="width: 100%">
            <el-table-column :label="$t('om.id')" type="index" width="40"></el-table-column>
            <el-table-column :label="$t('om.cache.list.label1')" align="center" prop="cacheName" :show-overflow-tooltip="true" :formatter="nameFormatter"></el-table-column>
            <el-table-column :label="$t('om.remarks')" align="center" prop="remark" :show-overflow-tooltip="true" width="90" />
            <el-table-column :label="$t('om.operation')" width="100" align="center" class-name="om-table-operation">
              <template #default="scope">
                <el-button type="danger" icon="Delete" @click="handleClearCacheName(scope.row)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ $t('om.cache.list.header2') }}</span>
              <el-button icon="Refresh" @click="refreshCacheKeys()"></el-button>
            </div>
          </template>
          <el-table v-loading="subLoading" :data="cacheKeys" :height="tableHeight" highlight-current-row @row-click="handleCacheValue" style="width: 100%">
            <el-table-column :label="$t('om.id')" width="40" type="index"></el-table-column>
            <el-table-column :label="$t('om.cache.list.label2')" align="center" :show-overflow-tooltip="true" :formatter="keyFormatter"></el-table-column>
            <el-table-column :label="$t('om.operation')" width="100" align="center" class-name="om-table-operation">
              <template #default="scope">
                <el-button type="danger" icon="Delete" @click="handleClearCacheKey(scope.row)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card :bordered="false">
          <template #header>
            <div class="card-header">
              <span>{{ $t('om.cache.list.header3') }}</span>
              <el-button icon="Delete" type="danger" @click="handleClearCacheAll()">{{ $t('om.cache.list.button1') }}</el-button>
            </div>
          </template>
          <el-form :model="cacheForm" :label-position="settingsStore.labelPosition">
            <el-form-item :label="$t('om.cache.list.label1')" prop="cacheName">
              <el-input v-model="cacheForm.cacheName" :read-only="true" />
            </el-form-item>
            <el-form-item :label="$t('om.cache.list.label2')" prop="cacheKey">
              <el-input v-model="cacheForm.cacheKey" :read-only="true" />
            </el-form-item>
            <el-form-item :label="$t('om.cache.list.label3')" prop="cacheValue">
              <el-input v-model="cacheForm.cacheValue" type="textarea" :autosize="{ minRows: 2, maxRows: 20 }" :read-only="true" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="CacheList">
import { clearCacheAll, clearCacheKey, clearCacheName, getCacheValue, listCacheKey, listCacheName } from '@/api/monitor/cache';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const cacheNames = ref([]);
const cacheKeys = ref([]);
const cacheForm = ref({});
const loading = ref(true);
const subLoading = ref(false);
const nowCacheName = ref('');
const tableHeight = ref(window.innerHeight - 200);

/** 查询缓存名称列表 */
function getCacheNames() {
  loading.value = true;
  listCacheName().then((response) => {
    cacheNames.value = response.data;
    loading.value = false;
  });
}

/** 刷新缓存名称列表 */
function refreshCacheNames() {
  getCacheNames();
  proxy.$modal.msgSuccess(proxy.$t('om.cache.list.msg1'));
}

/** 清理指定名称缓存 */
function handleClearCacheName(row) {
  clearCacheName(row.cacheName).then((response) => {
    proxy.$modal.msgSuccess(proxy.$t('om.cache.list.msg2', { field: nowCacheName.value }));
    getCacheKeys();
  });
}

/** 查询缓存键名列表 */
function getCacheKeys(row) {
  const cacheName = row !== undefined ? row.cacheName : nowCacheName.value;
  if (cacheName === '') {
    return;
  }
  subLoading.value = true;
  listCacheKey(cacheName).then((response) => {
    cacheKeys.value = response.data;
    subLoading.value = false;
    nowCacheName.value = cacheName;
  });
}

/** 刷新缓存键名列表 */
function refreshCacheKeys() {
  getCacheKeys();
  proxy.$modal.msgSuccess(proxy.$t('om.cache.list.msg3'));
}

/** 清理指定键名缓存 */
function handleClearCacheKey(cacheKey) {
  clearCacheKey(cacheKey).then((response) => {
    proxy.$modal.msgSuccess(proxy.$t('om.cache.list.msg4', { field: cacheKey }));
    getCacheKeys();
  });
}

/** 列表前缀去除 */
function nameFormatter(row) {
  return row.cacheName.replace(':', '');
}

/** 键名前缀去除 */
function keyFormatter(cacheKey) {
  return cacheKey.replace(nowCacheName.value, '');
}

/** 查询缓存内容详细 */
function handleCacheValue(cacheKey) {
  getCacheValue(nowCacheName.value, cacheKey).then((response) => {
    cacheForm.value = response.data;
  });
}

/** 清理全部缓存 */
function handleClearCacheAll() {
  clearCacheAll().then((response) => {
    proxy.$modal.msgSuccess(proxy.$t('om.cache.list.msg5'));
  });
}

getCacheNames();
</script>

<style lang="scss" scoped>
.om-app-container {
  padding: 20px;

  .el-card {
    height: calc(100vh - 200px);
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

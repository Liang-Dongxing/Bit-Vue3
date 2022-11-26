<template>
  <div class="om-app-container">
    <el-row :gutter="30">
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header><span>CPU</span></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('om.server.cpu.cpuNum')" v-if="server.cpu">{{ server.cpu.cpuNum }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.cpu.used')" v-if="server.cpu">{{ server.cpu.used }}%</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.cpu.sys')" v-if="server.cpu">{{ server.cpu.sys }}%</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.cpu.free')" v-if="server.cpu">{{ server.cpu.free }}%</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header><span>Memory</span></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('om.server.mem.total')" v-if="server.mem">{{ server.mem.total }}G</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.mem.used')" v-if="server.mem">{{ server.mem.used }}G</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.mem.free')" v-if="server.mem">{{ server.mem.free }}G</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.mem.usage')" v-if="server.mem">{{ server.mem.usage }}%</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <span>{{ $t('om.server.sys.title') }}</span>
          </template>
          <el-descriptions :column="4" border>
            <el-descriptions-item :label="$t('om.server.sys.computerName')" v-if="server.sys">{{ server.sys.computerName }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.sys.osName')" v-if="server.sys">{{ server.sys.osName }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.sys.computerIp')" v-if="server.sys">{{ server.sys.computerIp }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.sys.osArch')" v-if="server.sys">{{ server.sys.osArch }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <span>{{ $t('om.server.jvm.title') }}</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('om.server.mem.total')" v-if="server.jvm">{{ server.jvm.total }}G</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.mem.used')" v-if="server.jvm">{{ server.jvm.used }}G</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.mem.free')" v-if="server.jvm">{{ server.jvm.free }}G</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.mem.usage')" v-if="server.jvm">{{ server.jvm.usage }}%</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.jvm.name')" v-if="server.jvm">{{ server.jvm.name }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.jvm.version')" v-if="server.jvm">{{ server.jvm.version }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.jvm.startTime')" v-if="server.jvm">{{ server.jvm.startTime }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.jvm.runTime')" v-if="server.jvm">{{ server.jvm.runTime }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.jvm.home')" v-if="server.jvm" width="150">{{ server.jvm.home }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.jvm.userDir')" v-if="server.sys" width="150">{{ server.sys.userDir }}</el-descriptions-item>
            <el-descriptions-item :label="$t('om.server.jvm.inputArgs')" v-if="server.jvm" width="150">{{ server.jvm.inputArgs }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <span>{{ $t('om.server.sysFiles.title') }}</span>
          </template>
          <el-table :data="server.sysFiles">
            <el-table-column :label="$t('om.server.sysFiles.dirName')" prop="dirName" />
            <el-table-column :label="$t('om.server.sysFiles.sysTypeName')" prop="sysTypeName" />
            <el-table-column :label="$t('om.server.sysFiles.typeName')" prop="typeName" />
            <el-table-column :label="$t('om.server.sysFiles.total')" prop="total" />
            <el-table-column :label="$t('om.server.sysFiles.free')" prop="free" />
            <el-table-column :label="$t('om.server.sysFiles.used')" prop="used" />
            <el-table-column :label="$t('om.server.sysFiles.usage')" prop="usage">
              <template #default="scope">{{ scope.row.usage }}%</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { getServer } from '@/api/monitor/server';

const server = ref([]);
const { proxy } = getCurrentInstance();

function getList() {
  proxy.$modal.loading(proxy.$t('om.server.msg'));
  getServer().then((response) => {
    server.value = response.data;
    proxy.$modal.closeLoading();
  });
}

getList();
</script>

<style lang="scss" scoped>
.om-app-container {
  padding: 10px 20px 20px 20px;
}
</style>

<template>
  <div class="om-app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card>
          <el-descriptions class="margin-top" :title="$t('om.cache.title')" :column="4" border>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label1')">{{ cache.info.redis_version }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label2')">{{ cache.info.redis_mode === 'standalone' ? '单机' : '集群' }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label3')">{{ cache.info.tcp_port }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label4')">{{ cache.info.connected_clients }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label5')">{{ cache.info.uptime_in_days }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label6')">{{ cache.info.used_memory_human }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label7')">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label8')">{{ cache.info.maxmemory_human }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label9')">{{ cache.info.aof_enabled === '0' ? '否' : '是' }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label10')">{{ cache.info.rdb_last_bgsave_status }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.dbSize" :label="$t('om.cache.label11')">{{ cache.dbSize }}</el-descriptions-item>
            <el-descriptions-item v-if="cache.info" :label="$t('om.cache.label12')">{{ cache.info.instantaneous_input_kbps }}kps/{{ cache.info.instantaneous_output_kbps }}kps</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <span>{{ $t('om.cache.header1') }}</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <span>{{ $t('om.cache.header2') }}</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="usedmemory" style="height: 420px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Cache">
import { getCache } from '@/api/monitor/cache';
import * as echarts from 'echarts';

const cache = ref([]);
const commandstats = ref(null);
const usedmemory = ref(null);
const { proxy } = getCurrentInstance();

function getList() {
  proxy.$modal.loading(proxy.$t('om.cache.msg1'));
  getCache().then((response) => {
    proxy.$modal.closeLoading();
    cache.value = response.data;

    const commandstatsIntance = echarts.init(commandstats.value, 'macarons');
    commandstatsIntance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      series: [
        {
          name: proxy.$t('om.cache.echarts1'),
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: response.data.commandStats,
          animationEasing: 'cubicInOut',
          animationDuration: 1000,
        },
      ],
    });

    const usedmemoryInstance = echarts.init(usedmemory.value, 'macarons');
    usedmemoryInstance.setOption({
      tooltip: {
        formatter: '{b} <br/>{a} : ' + cache.value.info.used_memory_human,
      },
      series: [
        {
          name: proxy.$t('om.cache.echarts2'),
          type: 'gauge',
          min: 0,
          max: 1000,
          detail: {
            formatter: cache.value.info.used_memory_human,
          },
          data: [
            {
              value: parseFloat(cache.value.info.used_memory_human),
              name: proxy.$t('om.cache.echarts3'),
            },
          ],
        },
      ],
    });
  });
}

getList();
</script>

<style lang="scss" scoped>
.om-app-container {
  padding: 10px 20px 20px 20px;
}
</style>

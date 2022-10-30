<template>
  <div class="om-index">
    <el-row :gutter="20">
      <el-col :span="17">
        <el-card shadow="hover">
          <v-chart :option="dynamic_options" :autoresize="true" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card shadow="hover">
          <div class="info">
            <el-avatar :size="48" :src="userStore.avatar" @error="errorHandler">
              <icon-park v-if="userStore.sex === '0'" size="24" type="avatar" theme="filled" />
              <icon-park v-if="userStore.sex === '1'" size="24" type="women" theme="filled" />
              <icon-park v-if="userStore.sex === '2'" size="24" type="people" theme="filled" />
            </el-avatar>
            <div class="user-info">
              <span class="username">{{ userStore.nickName }}，{{ getGreet() }}</span>
              <span class="dept-name">{{ userStore.deptName }}</span>
            </div>
          </div>
        </el-card>
        <UpdateLog />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import useUserStore from '@/store/modules/user';
import { getGreet } from '@/utils/bit';
import UpdateLog from '@/components/UpdateLog';

const { proxy } = getCurrentInstance();
const userStore = useUserStore();
const dynamic_options = ref({});

onMounted(() => {
  dynamic_options_Fun();
});

const dynamic_options_Fun = () => {
  function randomData() {
    now = new Date(+now + oneDay);
    value = value + Math.random() * 21 - 10;
    return {
      name: now.toString(),
      value: [[now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'), Math.round(value)],
    };
  }

  let data = [];
  let now = new Date(1997, 9, 3);
  let oneDay = 24 * 3600 * 1000;
  let value = Math.random() * 1000;
  for (var i = 0; i < 1000; i++) {
    data.push(randomData());
  }
  dynamic_options.value = {
    title: {
      text: '用户访问量',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: 50,
      bottom: 20,
      left: 40,
      right: 0,
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        name: '人数',
        type: 'line',
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(1, 191, 236)',
            },
            {
              offset: 1,
              color: 'rgb(255,255,255)',
            },
          ]),
        },
        data: data,
      },
    ],
  };
  setInterval(function () {
    for (var i = 0; i < 5; i++) {
      data.shift();
      data.push(randomData());
    }
    dynamic_options.value = {
      series: [
        {
          data: data,
        },
      ],
    };
  }, 1000);
};

const errorHandler = () => true;
</script>

<style scoped lang="scss">
.om-index {
  margin: 10px 20px;

  .info {
    display: flex;
    flex-direction: row;
    align-items: center;

    .user-info {
      display: flex;
      flex-direction: column;
      margin-left: 10px;

      .username {
        font-size: 16px;
        font-weight: 600;
      }

      .dept-name {
        font-size: 12px;
        color: var(--el-color-primary);
      }
    }
  }

  .el-card + .el-card {
    margin-top: 20px;
  }
}
</style>

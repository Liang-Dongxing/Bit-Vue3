<template>
  <div class="om-app-container">
    <el-row :gutter="20">
      <el-col :span="7" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>{{ $t('om.user.p_i') }}</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <user-avatar />
            </div>
            <el-table :data="list" :show-header="false">
              <el-table-column prop="icon" label="icon" width="24px">
                <template #default="{ row }">
                  <icon-park :type="row.icon" theme="filled" />
                </template>
              </el-table-column>
              <el-table-column prop="label" label="label" width="110px" />
              <el-table-column prop="value" label="value" />
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="17" :xs="24">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>{{ $t('om.user.b_i') }}</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('om.user.b_i')" name="userinfo">
              <user-info :user="state.user" />
            </el-tab-pane>
            <el-tab-pane :label="$t('om.user.m_p')" name="resetPwd">
              <reset-pwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Profile">
import { getUserProfile } from '@/api/system/user';
import UserAvatar from '@/views/system/user/profile/userAvatar';
import UserInfo from '@/views/system/user/profile/userInfo';
import ResetPwd from '@/views/system/user/profile/resetPwd';

const { proxy } = getCurrentInstance();
const activeTab = ref('userinfo');
const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {},
});

const list = ref([]);

function getUser() {
  getUserProfile().then((response) => {
    state.user = response.data;
    state.roleGroup = response.roleGroup;
    state.postGroup = response.postGroup;

    list.value = [
      { icon: 'user', label: proxy.$t('om.user.name'), value: state.user.userName },
      { icon: 'phone', label: proxy.$t('om.user.mobile'), value: state.user.phonenumber },
      { icon: 'mail', label: proxy.$t('om.user.email'), value: state.user.email },
      {
        icon: 'peoples',
        label: proxy.$t('om.user.department'),
        value: state.user.dept ? `${state.user.dept.deptName} / ${state.postGroup}` : '',
      },
      { icon: 'permissions', label: proxy.$t('om.user.role'), value: state.roleGroup },
      { icon: 'calendar', label: proxy.$t('om.creation_time'), value: state.user.createTime },
    ];
  });
}

getUser();
</script>

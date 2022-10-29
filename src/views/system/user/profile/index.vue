<template>
  <div class="om-app-container">
    <el-row :gutter="20">
      <el-col :span="7" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>个人信息</span>
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
              <el-table-column prop="label" label="label" width="80px" />
              <el-table-column prop="value" label="value" />
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="17" :xs="24">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <user-info :user="state.user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
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
      { icon: 'user', label: '用户名称', value: state.user.userName },
      { icon: 'phone', label: '手机号码', value: state.user.phonenumber },
      { icon: 'mail', label: '用户邮箱', value: state.user.email },
      {
        icon: 'peoples',
        label: '所属部门',
        value: state.user.dept ? `${state.user.dept.deptName} / ${state.postGroup}` : '',
      },
      { icon: 'permissions', label: '所属角色', value: state.roleGroup },
      { icon: 'calendar', label: '创建日期', value: state.user.createTime },
    ];
  });
}

getUser();
</script>

<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" :label-position="settingsStore.labelPosition" label-width="80px">
    <el-form-item :label="$t('om.user.old_password')" prop="oldPassword">
      <el-input v-model="user.oldPassword" :placeholder="$t('om.please_enter') + $t('om.user.old_password')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('om.user.new_password')" prop="newPassword">
      <el-input v-model="user.newPassword" :placeholder="$t('om.please_enter') + $t('om.user.new_password')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('om.user.confirm_password')" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" :placeholder="$t('om.please_enter') + $t('om.user.confirm_password')" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">{{ $t('om.save') }}</el-button>
      <el-button type="danger" @click="close">{{ $t('om.cancel') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { updateUserPwd } from '@/api/system/user';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined,
});

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error(proxy.$t('om.login.msg1')));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: proxy.$t('om.user.rules10'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: proxy.$t('om.user.rules11'), trigger: 'blur' },
    { min: 5, max: 20, message: proxy.$t('om.user.rules5'), trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: proxy.$t('om.user.rules12'), trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' },
  ],
});

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate((valid) => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then((response) => {
        proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
      });
    }
  });
}
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
}
</script>

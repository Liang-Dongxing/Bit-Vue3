<template>
  <el-form ref="userRef" :model="user" :rules="rules" :label-position="settingsStore.labelPosition" label-width="80px">
    <el-form-item :label="$t('om.user.nickname')" prop="nickName">
      <el-input v-model="user.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item :label="$t('om.user.mobile')" prop="phonenumber">
      <el-input v-model="user.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item :label="$t('om.user.email')" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item :label="$t('om.user.gender')">
      <el-radio-group v-model="user.sex">
        <el-radio label="0">{{ $t('om.user.male') }}</el-radio>
        <el-radio label="1">{{ $t('om.user.female') }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">{{ $t('om.save') }}</el-button>
      <el-button type="danger" @click="close">{{ $t('om.cancel') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { updateUserProfile } from '@/api/system/user';
import useSettingsStore from '@/store/modules/settings';

const props = defineProps({
  user: {
    type: Object,
  },
});

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();

const rules = ref({
  nickName: [{ required: true, message: proxy.$t('om.user.rules3'), trigger: 'blur' }],
  email: [
    { required: true, message: proxy.$t('om.user.rules8'), trigger: 'blur' },
    { type: 'email', message: proxy.$t('om.user.rules6'), trigger: ['blur', 'change'] },
  ],
  phonenumber: [
    { required: true, message: proxy.$t('om.user.rules9'), trigger: 'blur' },
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: proxy.$t('om.user.rules7'), trigger: 'blur' },
  ],
});

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate((valid) => {
    if (valid) {
      updateUserProfile(props.user).then((response) => {
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

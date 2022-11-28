<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" :label-position="settingsStore.labelPosition" label-width="150px">
    <el-form-item :label="$t('om.gen.basicInfoForm.tableName')" prop="tableName">
      <el-input :placeholder="$t('om.please_enter')" v-model="info.tableName" />
    </el-form-item>
    <el-form-item :label="$t('om.gen.basicInfoForm.tableComment')" prop="tableComment">
      <el-input :placeholder="$t('om.please_enter')" v-model="info.tableComment" />
    </el-form-item>
    <el-form-item :label="$t('om.gen.basicInfoForm.className')" prop="className">
      <el-input :placeholder="$t('om.please_enter')" v-model="info.className" />
    </el-form-item>
    <el-form-item :label="$t('om.gen.basicInfoForm.functionAuthor')" prop="functionAuthor">
      <el-input :placeholder="$t('om.please_enter')" v-model="info.functionAuthor" />
    </el-form-item>
    <el-form-item :label="$t('om.remarks')" prop="remark">
      <el-input type="textarea" :rows="3" v-model="info.remark"></el-input>
    </el-form-item>
  </el-form>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings';

const settingsStore = useSettingsStore();
defineProps({
  info: {
    type: Object,
    default: null,
  },
});

// 表单校验
const rules = ref({
  tableName: [{ required: true, message: '请输入表名称', trigger: 'blur' }],
  tableComment: [{ required: true, message: '请输入表描述', trigger: 'blur' }],
  className: [{ required: true, message: '请输入实体类名称', trigger: 'blur' }],
  functionAuthor: [{ required: true, message: '请输入作者', trigger: 'blur' }],
});
</script>

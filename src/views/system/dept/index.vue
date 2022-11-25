<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.dept.name')" prop="deptName">
        <el-input v-model="queryParams.deptName" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('om.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('om.select')" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('om.operation')">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('om.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('om.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row justify="space-between" class="om-table-header">
      <el-col :span="21" :xs="24" :sm="18" :md="18" :lg="18" :xl="21">
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:dept:add']">{{ $t('om.add') }}</el-button>
        <el-button type="info" icon="Sort" @click="toggleExpandAll">{{ $t('om.expand_and_fold') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="refreshTable" v-loading="loading" :data="deptList" row-key="deptId" :default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column prop="deptName" :label="$t('om.dept.name')"></el-table-column>
      <el-table-column prop="orderNum" :label="$t('om.sort')" align="center" width="80"></el-table-column>
      <el-table-column prop="status" :label="$t('om.status')" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.creation_time')" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('om.operation')" align="center" width="150" class-name="om-table-operation">
        <template #default="scope">
          <el-tooltip :content="$t('om.add')" placement="top">
            <el-button type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.parentId !== 0" :content="$t('om.delete')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="deptRef" :model="form" :rules="rules" :label-position="settingsStore.labelPosition" label-width="80px">
        <el-form-item v-if="form.parentId !== 0" :label="$t('om.dept.parent')" prop="parentId">
          <el-tree-select v-model="form.parentId" :data="deptOptions" :props="{ value: 'deptId', label: 'deptName', children: 'children' }" value-key="deptId" :placeholder="$t('om.select')" check-strictly />
        </el-form-item>
        <el-form-item :label="$t('om.dept.name')" prop="deptName">
          <el-input v-model="form.deptName" :placeholder="$t('om.fuzzy_query')" />
        </el-form-item>
        <el-form-item :label="$t('om.sort')" prop="orderNum">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('om.dept.leader')" prop="leader">
          <el-input v-model="form.leader" :placeholder="$t('om.fuzzy_query')" maxlength="20" />
        </el-form-item>
        <el-form-item :label="$t('om.dept.phone')" prop="phone">
          <el-input v-model="form.phone" :placeholder="$t('om.fuzzy_query')" maxlength="11" />
        </el-form-item>
        <el-form-item :label="$t('om.user.email')" prop="email">
          <el-input v-model="form.email" :placeholder="$t('om.fuzzy_query')" maxlength="50" />
        </el-form-item>
        <el-form-item :label="$t('om.status')">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ $t('om.save') }}</el-button>
          <el-button @click="cancel">{{ $t('om.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Dept">
import { addDept, delDept, getDept, listDept, listDeptExcludeChild, updateDept } from '@/api/system/dept';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const deptList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const title = ref('');
const deptOptions = ref([]);
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  form: {},
  queryParams: {
    deptName: undefined,
    status: undefined,
  },
  rules: {
    parentId: [{ required: true, message: proxy.$t('om.dept.rules1'), trigger: 'blur' }],
    deptName: [{ required: true, message: proxy.$t('om.dept.rules2'), trigger: 'blur' }],
    orderNum: [{ required: true, message: proxy.$t('om.dept.rules3'), trigger: 'blur' }],
    email: [{ type: 'email', message: proxy.$t('om.dept.rules4'), trigger: ['blur', 'change'] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: proxy.$t('om.dept.rules5'), trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询部门列表 */
function getList() {
  loading.value = true;
  listDept(queryParams.value).then((response) => {
    deptList.value = proxy.handleTree(response.data, 'deptId');
    loading.value = false;
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0',
  };
  proxy.resetForm('deptRef');
}
/** 搜索按钮操作 */
function handleQuery() {
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}
/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  listDept().then((response) => {
    deptOptions.value = proxy.handleTree(response.data, 'deptId');
  });
  if (row != undefined) {
    form.value.parentId = row.deptId;
  }
  open.value = true;
  title.value = proxy.$t('om.dept.add');
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  listDeptExcludeChild(row.deptId).then((response) => {
    deptOptions.value = proxy.handleTree(response.data, 'deptId');
  });
  getDept(row.deptId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = proxy.$t('om.dept.edit');
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['deptRef'].validate((valid) => {
    if (valid) {
      if (form.value.deptId != undefined) {
        updateDept(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
          open.value = false;
          getList();
        });
      } else {
        addDept(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.message.add'));
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row) {
  const deptIds = row.deptId;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: deptIds }))
    .then(function () {
      return delDept(deptIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.message.delete'));
    })
    .catch(() => {});
}

getList();
</script>

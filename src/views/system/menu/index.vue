<template>
  <div class="om-app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-position="settingsStore.labelPosition" class="om-table-header" label-width="70px">
      <el-form-item :label="$t('om.menu.name')" prop="menuName">
        <el-input v-model="queryParams.menuName" :placeholder="$t('om.fuzzy_query')" clearable @keyup.enter="handleQuery" />
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
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:menu:add']">{{ $t('om.add') }}</el-button>
        <el-button type="info" icon="Sort" @click="toggleExpandAll">{{ $t('om.expand_and_fold') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="refreshTable" v-loading="loading" :data="menuList" row-key="menuId" :default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column prop="menuName" :label="$t('om.menu.name')" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="icon" :label="$t('om.menu.icon')" align="center" width="100">
        <template #default="scope">
          <icon-park v-if="scope.row && scope.row.icon !== '#'" :type="scope.row.icon" theme="filled" />
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" :label="$t('om.sort')" width="100"></el-table-column>
      <el-table-column prop="perms" :label="$t('om.menu.perms')" :show-overflow-tooltip="true" width="200"></el-table-column>
      <el-table-column prop="component" :label="$t('om.menu.component')" :show-overflow-tooltip="true" width="140"></el-table-column>
      <el-table-column prop="status" :label="$t('om.status')" width="80">
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
            <el-button type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.edit')" placement="top">
            <el-button type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('om.delete')" placement="top">
            <el-button type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="menuRef" :model="form" :rules="rules" :label-position="settingsStore.labelPosition" label-width="100px">
        <el-form-item :label="$t('om.menu.parent')">
          <el-tree-select v-model="form.parentId" :data="menuOptions" :props="{ value: 'menuId', label: 'menuName', children: 'children' }" value-key="menuId" :placeholder="$t('om.menu.select_parent')" check-strictly />
        </el-form-item>
        <el-form-item :label="$t('om.menu.type')" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio label="M">{{ $t('om.menu.directory') }}</el-radio>
            <el-radio label="C">{{ $t('om.menu.menu') }}</el-radio>
            <el-radio label="F">{{ $t('om.menu.button') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.menuType != 'F'" :label="$t('om.menu.icon')" prop="icon">
          <el-popover placement="bottom-start" :width="740" trigger="click" @show="showSelectIcon">
            <template #reference>
              <el-input v-model="form.icon" :placeholder="$t('om.menu.click_icon')" @blur="showSelectIcon" v-click-outside="hideSelectIcon">
                <template #prefix>
                  <svg-icon v-if="form.icon && form.icon.indexOf('--i') === 1" :icon-class="form.icon" class="el-input__icon" style="height: 32px; width: 16px" />
                  <icon-park v-if="form.icon" :type="form.icon" :size="16" theme="filled" />
                </template>
              </el-input>
            </template>
            <icon-select ref="iconSelectRef" @selected="selected" />
          </el-popover>
        </el-form-item>
        <el-form-item :label="$t('om.menu.name')" prop="menuName">
          <el-input v-model="form.menuName" :placeholder="$t('om.fuzzy_query')" />
        </el-form-item>
        <el-form-item :label="$t('om.sort')" prop="orderNum">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item v-if="form.menuType != 'F'">
          <template #label>
            <span>
              <el-tooltip :content="$t('om.menu.msg1')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{ $t('om.menu.label1') }}
            </span>
          </template>
          <el-radio-group v-model="form.isFrame">
            <el-radio label="0">是</el-radio>
            <el-radio label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.menuType != 'F'" prop="path">
          <template #label>
            <span>
              <el-tooltip :content="$t('om.menu.msg2')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{ $t('om.menu.label2') }}
            </span>
          </template>
          <el-input v-model="form.path" :placeholder="$t('om.fuzzy_query')" />
        </el-form-item>
        <el-form-item v-if="form.menuType == 'C'" prop="component">
          <template #label>
            <span>
              <el-tooltip :content="$t('om.menu.msg3')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{ $t('om.menu.label3') }}
            </span>
          </template>
          <el-input v-model="form.component" :placeholder="$t('om.fuzzy_query')" />
        </el-form-item>
        <el-form-item v-if="form.menuType != 'M'">
          <el-input v-model="form.perms" :placeholder="$t('om.fuzzy_query')" maxlength="100" />
          <template #label>
            <span>
              <el-tooltip :content="$t('om.menu.msg4')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{ $t('om.menu.label4') }}
            </span>
          </template>
        </el-form-item>
        <el-form-item v-if="form.menuType == 'C'">
          <el-input v-model="form.query" :placeholder="$t('om.fuzzy_query')" maxlength="255" />
          <template #label>
            <span>
              <el-tooltip :content="$t('om.menu.msg5')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{ $t('om.menu.label5') }}
            </span>
          </template>
        </el-form-item>
        <el-form-item v-if="form.menuType == 'C'">
          <template #label>
            <span>
              <el-tooltip :content="$t('om.menu.msg6')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{ $t('om.menu.label6') }}
            </span>
          </template>
          <el-radio-group v-model="form.isCache">
            <el-radio label="0">
              {{ $t('om.menu.label7') }}
            </el-radio>
            <el-radio label="1">
              {{ $t('om.menu.label8') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.menuType != 'F'">
          <template #label>
            <span>
              <el-tooltip :content="$t('om.menu.msg7')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{ $t('om.menu.label9') }}
            </span>
          </template>
          <el-radio-group v-model="form.visible">
            <el-radio v-for="dict in sys_show_hide" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.menuType != 'F'">
          <template #label>
            <span>
              <el-tooltip :content="$t('om.menu.msg8')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{ $t('om.menu.label10') }}
            </span>
          </template>
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

<script setup name="Menu">
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from '@/api/system/menu';
import SvgIcon from '@/components/SvgIcon';
import IconSelect from '@/components/IconSelect';
import { ClickOutside as vClickOutside } from 'element-plus';
import useSettingsStore from '@/store/modules/settings';

const { proxy } = getCurrentInstance();
const settingsStore = useSettingsStore();
const { sys_show_hide, sys_normal_disable } = proxy.useDict('sys_show_hide', 'sys_normal_disable');

const menuList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const title = ref('');
const menuOptions = ref([]);
const isExpandAll = ref(false);
const refreshTable = ref(true);
const showChooseIcon = ref(false);
const iconSelectRef = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    menuName: undefined,
    visible: undefined,
  },
  rules: {
    menuName: [{ required: true, message: proxy.$t('om.menu.rules1'), trigger: 'blur' }],
    orderNum: [{ required: true, message: proxy.$t('om.menu.rules2'), trigger: 'blur' }],
    path: [{ required: true, message: proxy.$t('om.menu.rules3'), trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询菜单列表 */
function getList() {
  loading.value = true;
  listMenu(queryParams.value).then((response) => {
    menuList.value = proxy.handleTree(response.data, 'menuId');
    loading.value = false;
  });
}
/** 查询菜单下拉树结构 */
function getTreeselect() {
  menuOptions.value = [];
  listMenu().then((response) => {
    const menu = { menuId: 0, menuName: proxy.$t('om.menu.label11'), children: [] };
    menu.children = proxy.handleTree(response.data, 'menuId');
    menuOptions.value.push(menu);
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
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: 'M',
    orderNum: undefined,
    isFrame: '1',
    isCache: '0',
    visible: '0',
    status: '0',
  };
  proxy.resetForm('menuRef');
}
/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value.reset();
  // showChooseIcon.value = true;
}
/** 选择图标 */
function selected(name) {
  form.value.icon = name;
  // showChooseIcon.value = false;
}
/** 图标外层点击隐藏下拉列表 */
function hideSelectIcon(event) {
  var elem = event.relatedTarget || event.srcElement || event.target || event.currentTarget;
  var className = elem.className;
  if (className !== 'el-input__inner') {
    // showChooseIcon.value = false;
  }
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
  getTreeselect();
  if (row != null && row.menuId) {
    form.value.parentId = row.menuId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = proxy.$t('om.menu.add');
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
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  getMenu(row.menuId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = proxy.$t('om.menu.edit');
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['menuRef'].validate((valid) => {
    if (valid) {
      if (form.value.menuId != undefined) {
        updateMenu(form.value).then((response) => {
          proxy.$modal.msgSuccess(proxy.$t('om.message.edit'));
          open.value = false;
          getList();
        });
      } else {
        addMenu(form.value).then((response) => {
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
  const menuIds = row.menuId;
  proxy.$modal
    .confirm(proxy.$t('om.message.del_msg', { field: menuIds }))
    .then(function () {
      return delMenu(menuIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(proxy.$t('om.message.delete'));
    })
    .catch(() => {});
}

getList();
</script>

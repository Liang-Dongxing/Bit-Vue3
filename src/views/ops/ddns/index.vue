<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="主机记录" prop="hostRecord">
        <el-input
            v-model="queryParams.hostRecord"
            placeholder="请输入主机记录"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="解析记录类型" prop="parseRecordType">
        <el-select v-model="queryParams.parseRecordType" placeholder="请选择解析记录类型" clearable>
          <el-option
              v-for="dict in parse_record_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['ops:ddns:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['ops:ddns:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['ops:ddns:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['ops:ddns:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ddnsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ddns ID" align="center" prop="ddnsId"/>
      <el-table-column label="主机记录" align="center" prop="hostRecord"/>
      <el-table-column label="域名" align="center" prop="domain"/>
      <el-table-column label="解析记录类型" align="center" prop="parseRecordType">
        <template #default="scope">
          <dict-tag :options="parse_record_type" :value="scope.row.parseRecordType"/>
        </template>
      </el-table-column>
      <el-table-column label="Access ID" align="center" prop="accessId"/>
      <el-table-column label="备注" align="center" prop="remark"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              type="text"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['ops:ddns:edit']"
          >修改
          </el-button>
          <el-button
              type="text"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['ops:ddns:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改ddns 解析配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="ddnsRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="主机记录" prop="hostRecord">
          <el-input v-model="form.hostRecord" placeholder="请输入主机记录"/>
        </el-form-item>
        <el-form-item label="域名" prop="domain">
          <el-input v-model="form.domain" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="解析记录类型" prop="parseRecordType">
          <el-select v-model="form.parseRecordType" placeholder="请选择解析记录类型">
            <el-option
                v-for="dict in parse_record_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Access Id" prop="accessId">
          <el-select v-model="form.accessId" placeholder="Access Id">
            <el-option
                v-for="access in accessList"
                :key="access.accessId"
                :label="access.accessId"
                :value="access.accessId"
            >
              <span class="accessList">{{ access.accessId }}</span>
              <span class="accessList">{{ access.accessKeyId }}</span>
              <span class="accessList">
                <dict-tag :options="access_key_type" :value="access.accessKeyType"/>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Ddns">
import {listDdns, getDdns, delDdns, addDdns, updateDdns} from "@/api/ops/ddns";
import {listAccess} from "@/api/ops/access";

const {proxy} = getCurrentInstance();
const {parse_record_type, access_key_type} = proxy.useDict('parse_record_type', 'access_key_type');

const ddnsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const accessList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    domain: null,
    hostRecord: null,
    parseRecordType: null,
    accessId: null,
  },
  rules: {
    domain: [
      {required: true, message: "域名不能为空", trigger: "blur"}
    ],
    hostRecord: [
      {required: true, message: "主机记录不能为空", trigger: "blur"}
    ],
    parseRecordType: [
      {required: true, message: "解析记录类型不能为空", trigger: "change"}
    ],
    accessId: [
      {required: true, message: "Access ID不能为空", trigger: "change"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询ddns 解析配置列表 */
function getList() {
  loading.value = true;
  listDdns(queryParams.value).then(response => {
    ddnsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 查询第三方AccessKey列表 */
function getAccessKeyList() {
  listAccess().then(response => {
    accessList.value = response.rows;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    ddnsId: null,
    domain: null,
    hostRecord: null,
    parseRecordType: null,
    accessId: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("ddnsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.ddnsId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加ddns 解析配置";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _ddnsId = row.ddnsId || ids.value
  getDdns(_ddnsId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改ddns 解析配置";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ddnsRef"].validate(valid => {
    if (valid) {
      if (form.value.ddnsId != null) {
        updateDdns(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDdns(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ddnsIds = row.ddnsId || ids.value;
  proxy.$modal.confirm('是否确认删除ddns 解析配置编号为"' + _ddnsIds + '"的数据项？').then(function () {
    return delDdns(_ddnsIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ops/ddns/export', {
    ...queryParams.value
  }, `ddns_${new Date().getTime()}.xlsx`)
}

getList();
getAccessKeyList();
</script>
<style lang="scss" scoped>

::v-deep(.accessList){
  margin-right: 10px;
  div{
    display: inline;
  }
}
</style>

<template>
  <div class="user-info-head" @click="editCropper()">
    <el-avatar :size="110" :src="options.img" alt="点击上传头像" @error="errorHandler">
      <icon-park v-if="userStore.sex === '0'" size="24" type="avatar" theme="filled" />
      <icon-park v-if="userStore.sex === '1'" size="24" type="women" theme="filled" />
      <icon-park v-if="userStore.sex === '2'" size="24" type="people" theme="filled" />
    </el-avatar>
  </div>
  <el-dialog :title="title" v-model="open" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
    <el-row>
      <el-col :xs="24" :md="12" :style="{ height: '350px' }">
        <vue-cropper ref="cropper" :img="options.img" :info="true" :auto-crop="options.autoCrop" :auto-crop-width="options.autoCropWidth" :auto-crop-height="options.autoCropHeight" :fixed-box="options.fixedBox" @realTime="realTime" v-if="visible" />
      </el-col>
      <el-col :xs="24" :md="12" :style="{ height: '350px' }">
        <div class="avatar-upload-preview">
          <img :src="options.previews.url" :style="options.previews.img" />
        </div>
      </el-col>
    </el-row>
    <br />
    <el-row>
      <el-col :lg="2" :md="2">
        <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
          <el-button>
            选择
            <el-icon class="el-icon--right"><Upload /></el-icon>
          </el-button>
        </el-upload>
      </el-col>
      <el-col :lg="{ span: 1, offset: 2 }" :md="2">
        <el-button icon="Plus" @click="changeScale(1)"></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button icon="Minus" @click="changeScale(-1)"></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button icon="RefreshLeft" @click="rotateLeft()"></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button icon="RefreshRight" @click="rotateRight()"></el-button>
      </el-col>
      <el-col :lg="{ span: 2, offset: 6 }" :md="2">
        <el-button type="primary" @click="uploadImg()">提 交</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script setup>
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import { uploadAvatar } from '@/api/system/user';
import useUserStore from '@/store/modules/user';

const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const open = ref(false);
const visible = ref(false);
const title = ref('修改头像');

//图片裁剪数据
const options = reactive({
  img: userStore.avatar, // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true, // 固定截图框大小 不允许改变
  previews: {}, //预览数据
});

/** 编辑头像 */
function editCropper() {
  open.value = true;
}
/** 打开弹出层结束时的回调 */
function modalOpened() {
  visible.value = true;
}
/** 覆盖默认上传行为 */
function requestUpload() {}
/** 向左旋转 */
function rotateLeft() {
  proxy.$refs.cropper.rotateLeft();
}
/** 向右旋转 */
function rotateRight() {
  proxy.$refs.cropper.rotateRight();
}
/** 图片缩放 */
function changeScale(num) {
  num = num || 1;
  proxy.$refs.cropper.changeScale(num);
}
/** 上传预处理 */
function beforeUpload(file) {
  if (file.type.indexOf('image/') == -1) {
    proxy.$modal.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。');
  } else {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      options.img = reader.result;
    };
  }
}
/** 上传图片 */
function uploadImg() {
  proxy.$refs.cropper.getCropBlob((data) => {
    let formData = new FormData();
    formData.append('avatarfile', data);
    uploadAvatar(formData).then((response) => {
      open.value = false;
      options.img = import.meta.env.VITE_APP_BASE_API + response.imgUrl;
      userStore.avatar = options.img;
      proxy.$modal.msgSuccess('修改成功');
      visible.value = false;
    });
  });
}
/** 实时预览 */
function realTime(data) {
  options.previews = data;
}
/** 关闭窗口 */
function closeDialog() {
  options.img = userStore.avatar;
  options.visible = false;
}

const errorHandler = () => true;
</script>

<style lang="scss" scoped>
@import 'vue-cropper/dist/index.css';

.user-info-head {
  cursor: pointer;
  display: flex;
  justify-content: center;

  .el-avatar {
    border: 2px dashed var(--el-border-color);
    background-color: var(--el-bg-color);
  }
  .el-avatar:hover {
    border-color: var(--el-color-primary);
  }
}
.avatar-upload-preview {
  width: 200px;
  height: 200px;
  overflow: hidden;
}
</style>

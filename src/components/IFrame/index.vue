<template>
  <div class="om-app-container">
    <iframe ref="iframeRef" width="100%" :height="iframeHeight" :src="url" title="iframe" />
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const iframeRef = ref();
const iframeHeight = ref('100%');
const url = computed(() => props.src);
let iframeSetInterval = null;

onUnmounted(() => {
  clearInterval(iframeSetInterval);
});

onMounted(() => {
  iframeSetInterval = setInterval(() => {
    if (iframeRef.value) {
      iframeRef.value.contentWindow.document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      let height = iframeRef.value.contentWindow.document.getElementsByTagName('html')[0].offsetHeight + 'px';
      if (!(height === iframeHeight.value)) {
        iframeHeight.value = height;
      }
    }
  }, 500);
});
</script>
<style lang="scss" scoped>
.om-app-container {
  overflow: hidden;

  iframe {
    border: unset;
    overflow: hidden;
  }
}
</style>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="icon-close-btn" aria-label="关闭" @click="onClose">&times;</button>
      <h2>图像编辑</h2>
      <Cropper
        ref="cropperRef"
        class="cropper"
        :src="imageUrl"
        :stencil-props="{ aspectRatio: 1 }"
        :resize-image="{ adjustStencil: false }"
      />
      <button class="button" @click="onConfirm">确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { Cropper } from 'vue-advanced-cropper';

const props = defineProps<{
  file: File;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', value: Blob): void;
}>();

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null);
const imageUrl = ref('');
let lastUrl = '';

watch(
  () => props.file,
  (file) => {
    if (lastUrl) {
      URL.revokeObjectURL(lastUrl);
      lastUrl = '';
    }
    if (file) {
      lastUrl = URL.createObjectURL(file);
      imageUrl.value = lastUrl;
    }
  },
  { immediate: true }
);

const onConfirm = () => {
  const result = cropperRef.value?.getResult();
  if (!result?.canvas) return;

  const sourceCanvas = result.canvas;
  const targetWidth = 640;
  const scale = sourceCanvas.width ? targetWidth / sourceCanvas.width : 1;
  const targetHeight = Math.max(1, Math.round(sourceCanvas.height * scale));

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = targetWidth;
  outputCanvas.height = targetHeight;
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

  outputCanvas.toBlob((blob) => {
    if (blob) {
      emit('confirm', blob);
    }
  }, 'image/png');
};

const onClose = () => {
  emit('close');
};

onBeforeUnmount(() => {
  if (lastUrl) {
    URL.revokeObjectURL(lastUrl);
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 24px 24px 16px;
  min-width: 400px;
  max-height: 80vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.icon-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
}

.icon-close-btn:hover {
  color: #000;
}

.input-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.input-item:last-child {
  margin-bottom: 0;
}

.input-label {
  width: 100%;
  font-size: 14px;
  margin-bottom: 4px;
  text-align: left;
}

.input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  resize: none;
}

.button {
  margin-top: 1.2rem;
  width: 150px;
  height: 40px;
  border-radius: 25px;
  background: #057feb;
  border: none;
  color: white;
}

.avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  margin-top: 12px;
  margin-bottom: 12px;
}

.nickname {
  flex-grow: 1;
  text-align: left;
}

.invite-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.invite-btn:hover {
  background-color: #0056b3;
}
</style>

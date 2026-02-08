<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="icon-close-btn" aria-label="关闭" @click="onClose">&times;</button>

      <h2>创建服务器</h2>
      <p>一个名称以及图标就能赋予您的服务器个性。之后，您可以随时进行变更。</p>

      <img :src="croppedUrl || '/images/avatar/default-avatar.png'" alt="头像" class="avatar" @click="selectFile" />

      <div class="input-item">
        <label class="input-label">服务器名称</label>
        <input v-model="serverName" class="input" />
      </div>

      <button class="button" @click="createServer">创建</button>
    </div>
  </div>

  <ImageEdit v-if="imageEditDialog && file" :file="file" @close="toggleImageEditDialog" @confirm="onConfirm" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageEdit from './ImageEdit.vue';
import { serverStore } from '@/services/state';
import { requestService } from '@/services/request';
import { serverService } from '@/services/api/server';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const imageEditDialog = ref(false);
const file = ref<File | null>(null);
const croppedUrl = ref('');
const cropped = ref<Blob | null>(null);
const serverName = ref<string>();

const onClose = () => {
  emit('close');
};

const selectFile = async () => {
  try {
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'Images',
          accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
          },
        },
      ],
      multiple: false,
    });
    file.value = await fileHandle.getFile();
    toggleImageEditDialog();
  } catch (error) {
    console.error('文件选择已取消', error);
  }
};

const toggleImageEditDialog = () => {
  imageEditDialog.value = !imageEditDialog.value;
};

const onConfirm = (croppedBlob: Blob) => {
  cropped.value = croppedBlob;
  croppedUrl.value = URL.createObjectURL(croppedBlob);
  toggleImageEditDialog();
};

const createServer = () => {
  serverService.createServer(serverName.value).then((serverId) => {
    if (!serverId) return;
    if (cropped.value) {
      serverService.uploadIcon(cropped.value as File, serverId).subscribe({
        next: () => {
          console.log('Upload successful');
        },
        error: (err) => console.error('Upload failed', err),
      });
    }
    requestService.requestServerInfoByIds([serverId]).then();
    serverStore.servers.push(serverId);
  });
  alert('服务器创建成功');
  onClose();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 24px 24px 16px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
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
  border-radius: 10px;
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

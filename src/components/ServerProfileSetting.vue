<template>
  <Avatar ref="serverIconRef" class="avatar" type="server" :id="serverId" @click="selectFile" />

  <div class="input-item">
    <label class="input-label">服务器名称</label>
    <input v-model="serverInfo.serverName" class="input" />
  </div>

  <div class="input-item">
    <label class="input-label">服务器简介</label>
    <textarea v-model="serverInfo.serverDescription" class="input"></textarea>
  </div>

  <div>
    <button
      :class="hasChanges ? 'save-button' : 'save-button-disable'"
      :disabled="!hasChanges"
      @click="updateServerInfo"
    >
      保存
    </button>
  </div>

  <ImageEdit v-if="imageEditDialog && file" :file="file" @close="toggleImageEditDialog" @confirm="onConfirm" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Avatar from './Avatar.vue';
import ImageEdit from './ImageEdit.vue';
import { serverService } from '@/services/api/server';
import { requestService } from '@/services/request';
import { serverStore } from '@/services/state';

const props = defineProps<{
  serverId: string;
}>();

const serverIconRef = ref<InstanceType<typeof Avatar> | null>(null);

const imageEditDialog = ref(false);
const file = ref<File | null>(null);

const originServerInfo = ref({
  serverName: null as string | null,
  serverDescription: null as string | null,
});

const serverInfo = ref({
  serverName: null as string | null,
  serverDescription: null as string | null,
});

const updateServerInfo = async () => {
  const success = await serverService.updatesServerProfile(
    props.serverId,
    serverInfo.value.serverName,
    serverInfo.value.serverDescription
  );
  if (!success) return;

  await requestService.requestServerInfoByIds([props.serverId]);

  Object.assign(serverService.serverInfo, serverStore.getServerInfoById(props.serverId));
  alert('成功更改');
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

const onConfirm = (croppedBlob: Blob) => {
  toggleImageEditDialog();
  serverService.uploadIcon(croppedBlob as File, props.serverId).subscribe({
    next: () => {
      serverIconRef.value?.refreshAvatar();
    },
    error: (err) => console.error('Upload failed', err),
  });
};

const toggleImageEditDialog = () => {
  imageEditDialog.value = !imageEditDialog.value;
};

onMounted(() => {
  originServerInfo.value.serverName = serverService.serverInfo?.name ?? null;
  originServerInfo.value.serverDescription = serverService.serverInfo?.description ?? null;
  serverInfo.value.serverName = serverService.serverInfo?.name ?? null;
  serverInfo.value.serverDescription = serverService.serverInfo?.description ?? null;
});

const hasChanges = computed(() => {
  return (
    originServerInfo.value.serverName !== serverInfo.value.serverName ||
    originServerInfo.value.serverDescription !== serverInfo.value.serverDescription
  );
});
</script>

<style scoped>
.avatar {
  width: 128px;
  height: 128px;
  border-radius: 10px;
  margin-top: 12px;
  margin-bottom: 12px;
  object-fit: cover;
  display: block;
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

.save-button {
  margin-top: 1.2rem;
  width: 150px;
  height: 40px;
  border-radius: 25px;
  background: #057feb;
  border: none;
  color: white;
  transition: background 0.3s ease, transform 0.5s ease;
}

.save-button-disable {
  margin-top: 1.2rem;
  width: 150px;
  height: 40px;
  border-radius: 25px;
  background: #878787;
  border: none;
  color: white;
  transition: background 0.3s ease, transform 0.5s ease;
}

.save-button:hover {
  transform: scale(1.05);
}
</style>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="icon-close-btn" aria-label="关闭" @click="onClose">&times;</button>
      <div class="main-container">
        <div class="sidebar">
          <div
            v-for="(item, i) in sidebarItems"
            :key="i"
            :class="{ selected: selectedIndex === i }"
            @click="selectItem(i)"
          >
            <span>{{ item.label }}</span>
          </div>
        </div>
        <div class="context">
          <ServerProfileSetting :serverId="serverId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ServerProfileSetting from './ServerProfileSetting.vue';
import { serverService } from '@/services/api/server';
import { serverStore } from '@/services/state';

const props = defineProps<{
  serverId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const selectedIndex = ref(0);
const sidebarItems = ref<Array<{ label: string; action?: () => void; button?: boolean }>>([]);

onMounted(() => {
  sidebarItems.value = [{ label: '服务器资料' }];
  if (serverService.currentRolePermissions.includes(0)) {
    sidebarItems.value.push({
      label: '解散服务器',
      action: () => dissolveServer(),
      button: true,
    });
  }
});

const selectItem = (index: number) => {
  const item = sidebarItems.value[index];
  if (!item.button) {
    selectedIndex.value = index;
  }
  if (item.action) {
    item.action();
  }
};

const onClose = () => {
  emit('close');
};

const dissolveServer = () => {
  if (!confirm('确认要解散该服务器吗？')) {
    return;
  }
  serverService.deleteServer(props.serverId).then(() => {
    serverStore.servers = serverStore.servers.filter((item) => item !== props.serverId);
    serverStore.currentServer = '';
    router.push('/main/session');
    emit('close');
  });
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

.main-container {
  width: 100%;
  display: flex;
  flex-direction: row;
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

.sidebar {
  color: black;
  display: flex;
  flex-direction: column;
  margin-right: 50px;
}

.sidebar div {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.sidebar div:hover {
  background-color: #e4e4e4;
}

.sidebar div.selected {
  background-color: #cccccc;
  font-weight: bold;
}

.sidebar img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.sidebar span {
  font-size: 16px;
  font-weight: 500;
  margin-right: 10px;
}

.context {
}
</style>

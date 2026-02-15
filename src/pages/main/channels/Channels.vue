<template>
  <div class="contact-list">
    <div class="sidebar">
      <div class="search-bar">
        <input type="text" placeholder="搜索服务器..." class="search-input" />
      </div>
      <div class="action-buttons">
        <button class="btn add-contact" @click="toggleCreateServerDialog">创建新服务器</button>
        <button class="btn friend-requests">搜索</button>
      </div>
      <div v-for="serverId in serverStore.servers" :key="serverId" class="contact-item">
        <Avatar class="avatar" type="server" :id="serverId" />
        <span class="contact-name">{{ serverStore.getServerInfoById(serverId)?.name }}</span>
      </div>
    </div>
    <div class="main-content">
      <RouterView />
    </div>
  </div>

  <CreateServerDialog v-if="createServerDialog" @close="toggleCreateServerDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import Avatar from '@/components/Avatar.vue';
import CreateServerDialog from '@/components/CreateServerDialog.vue';
import { serverStore } from '@/services/state';

const createServerDialog = ref(false);

const toggleCreateServerDialog = () => {
  createServerDialog.value = !createServerDialog.value;
};
</script>

<style scoped>
.contact-list {
  width: 100%;
  display: flex;
  height: 100%;
}

@media (max-aspect-ratio: 1/1) {
  .layout-container {
    flex-direction: column;
    height: auto;
  }

  .sidebar {
    width: 100%;
    height: 100%;
  }

  .main-content {
    width: 100%;
  }
}

.sidebar {
  box-sizing: border-box;
  background-color: var(--color-bg-sidebar);
  color: var(--color-text-inverse);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.main-content {
  width: 100%;
  flex: 1;
  background-color: var(--color-bg-main);
}

.search-bar {
  flex: 0 0 auto;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  color: var(--color-text-primary);
  background-color: var(--color-bg-panel-subtle);
}

.action-buttons {
  display: flex;
  flex-direction: column;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-contact {
  background-color: var(--color-primary-strong);
  color: var(--color-text-inverse);
}

.add-contact:hover {
  background-color: var(--color-primary-hover);
}

.friend-requests {
  margin-top: 5px;
  background-color: var(--color-warning);
  color: var(--color-text-inverse);
}

.friend-requests:hover {
  background-color: var(--color-warning-hover);
}

.contact-items {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-top: 10px;
  background-color: var(--color-bg-sidebar-elevated);
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.contact-item:hover {
  background-color: var(--color-bg-sidebar-hover);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  margin-right: 10px;
}

.contact-name {
  font-size: 16px;
  color: var(--color-text-inverse);
}
</style>

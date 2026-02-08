<template>
  <div class="settings-root">
    <div class="container">
      <div class="sidebar">
        <div
          v-for="(item, i) in sidebarItems"
          :key="item.label + i"
          :class="{ selected: selectedIndex === i }"
          @click="selectItem(i)"
        >
          <img :alt="item.label" :src="item.icon" />
          <span>{{ item.label }}</span>
        </div>
      </div>
      <div class="content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const router = useRouter();
const selectedIndex = ref(0);
const sidebarItems = [
  { icon: '/images/icon/gpp_maybe.svg', label: '登录设置', url: '/main/settings/account_manage' },
  { icon: '/images/icon/gpp_maybe.svg', label: '常规设置', url: '/main/settings/general_settings' },
  { icon: '/images/icon/gpp_maybe.svg', label: '通知管理' },
  { icon: '/images/icon/gpp_maybe.svg', label: '安全设置' },
  { icon: '/images/icon/gpp_maybe.svg', label: '存储管理' },
];

const selectItem = (index: number) => {
  selectedIndex.value = index;
  const item = sidebarItems[index];
  if ('url' in item && item.url) {
    router.push(item.url);
  }
};

onMounted(() => {
  selectItem(selectedIndex.value);
});
</script>

<style scoped>
.settings-root {
  display: flex;
  width: 100%;
  height: 100%;
}

.container {
  width: 100%;
  display: flex;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  background-color: #3b96ff;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border-right: 0.1rem solid #1781ff;
}

.sidebar div {
  background-color: #5fa7ff;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.sidebar div:hover {
  background-color: #1781ff;
}

.sidebar div.selected {
  background-color: #1781ff;
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

.content {
  flex-grow: 1;
  background-color: white;
  overflow-y: auto;
}
</style>

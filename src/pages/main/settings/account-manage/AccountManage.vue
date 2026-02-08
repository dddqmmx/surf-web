<template>
  <div class="account-root">
    <div class="settings-container">
      <div class="settings-header">登录设置</div>
      <div class="settings-section">
        <div class="settings-title">账号</div>
        <div class="settings-item">
          <label class="settings-label">自动登录</label>
          <label class="settings-toggle">
            <input v-model="rememberMe" type="checkbox" @change="onRememberMeChange(rememberMe)" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="settings-item">
          <label class="settings-label">退出登录</label>
          <button class="settings-input" @click="logout">退出登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authState } from '@/services/state';

const router = useRouter();
const rememberMe = ref(false);

onMounted(() => {
  const storedRememberMe = localStorage.getItem('rememberMe') || '';
  if (storedRememberMe === 'true') {
    rememberMe.value = true;
  }
});

const onRememberMeChange = (newValue: boolean) => {
  localStorage.setItem('rememberMe', newValue.toString());
};

const logout = () => {
  localStorage.setItem('rememberMe', 'false');
  authState.clientUserId = '';
  router.push('/login');
};
</script>

<style scoped>
.account-root {
  display: flex;
  width: 100%;
  height: 100%;
}

.settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.settings-header {
  background-color: #3b96ff;
  color: white;
  padding: 10px;
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}

.settings-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  overflow-y: auto;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-title {
  margin-bottom: 10px;
  font-size: 1.5em;
  color: #555;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.settings-item:last-child {
  margin-bottom: 0;
}

.settings-label {
  font-size: 1.2em;
  color: #333;
}

.settings-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
}

.settings-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.settings-toggle input {
  display: none;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #6b73ff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}
</style>

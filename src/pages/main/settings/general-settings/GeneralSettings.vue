<template>
  <div class="general-root">
    <div class="settings-container">
      <div class="settings-header">常规设置</div>
      <div class="settings-section">
        <div class="settings-title">服务器</div>
        <div class="settings-item">
          <label class="settings-label">登录服务器</label>
          <input class="settings-input" placeholder="输入服务器IP" />
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-title">语言设置</div>
        <div class="settings-item">
          <label class="settings-label">语言</label>
          <select class="settings-input">
            <option>简体中文</option>
            <option>日本語</option>
          </select>
        </div>
        <div class="settings-item">
          <label class="settings-label">主题</label>
          <select v-model="themeMode" class="settings-input">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { themeState, type ThemeMode } from '@/services/state/theme-state';

const themeMode = computed({
  get: () => themeState.mode,
  set: (value) => themeState.setTheme(value as ThemeMode),
});
</script>

<style scoped>
.general-root {
  display: flex;
  width: 100%;
  height: 100%;
}

.settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-main);
}

.settings-header {
  background-color: var(--color-bg-sidebar);
  color: var(--color-text-inverse);
  padding: 10px;
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}

.settings-section {
  padding: 20px;
  border-bottom: 1px solid var(--color-border-subtle);
  overflow-y: auto;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-title {
  margin-bottom: 10px;
  font-size: 1.5em;
  color: var(--color-text-secondary);
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
  color: var(--color-text-primary);
}

.settings-input {
  padding: 10px;
  border: 1px solid var(--color-border-default);
  border-radius: 5px;
  font-size: 1em;
  background: var(--color-bg-main);
  color: var(--color-text-primary);
}
</style>

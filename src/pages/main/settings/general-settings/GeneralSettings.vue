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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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
</style>

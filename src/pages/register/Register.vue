<template>
  <div class="container">
    <div class="login-tabs">
      <span class="login-title">注册一个Surf账号</span>
      <div class="form-input">
        <span>账号</span>
        <input v-model="username" type="text" />
      </div>
      <div class="form-input">
        <span>密码</span>
        <input v-model="password" type="password" />
      </div>
      <div class="form-input">
        <span>重复密码</span>
        <input v-model="confirmPassword" type="password" />
      </div>
      <button class="login-button" @click="register">注册</button>
      <a class="to_user_manager" @click="router.push('/login')">已有账号?点击登录</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { requestService } from '@/services/request';

const router = useRouter();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const register = () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    alert('请填写所有字段');
    return;
  }

  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致');
    return;
  }

  requestService.requestRegister(username.value, password.value).then((response) => {
    if (response) {
      alert('注册成功');
      requestService.requestLogin(username.value, password.value).then((loginOk) => {
        if (loginOk) {
          router.push('/main/session');
        }
      });
    } else {
      alert('注册失败，未知原因');
    }
  });
};
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-position: center center;
  background-size: cover;
  background-image: url('/images/background/login.png');
  background-color: rgba(0, 0, 0, 0.3);
  background-blend-mode: darken;
}

.info-panel {
  display: none;
  width: 500px;
  height: 478px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  margin-right: 20px;
  overflow: hidden;
  overflow-y: auto;
}

.info-panel::-webkit-scrollbar {
  display: none;
}

.info-content {
  margin: 2rem;
}

.info-content h2 {
  color: #057feb;
  border-bottom: 2px solid #057feb;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.server-info p,
.announcement-item {
  margin-bottom: 10px;
  color: #333;
}

.announcement-item {
  background: #f4f4f4;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.announcement-item .date {
  color: #888;
  font-size: 0.8em;
  display: block;
  text-align: right;
  margin-top: 10px;
}

.login-tabs {
  width: 400px;
  min-height: 478px;
  align-items: center;
  background: white;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 3rem;
}

.login-tabs span {
  margin-top: 10px;
}

.login-title {
  font-size: 25px;
  color: #057feb;
  margin-bottom: 20px;
}

.user-avatar {
  margin-top: 1rem;
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.select-server {
  margin-top: 1rem;
}

.login-button {
  margin-top: 1.2rem;
  width: 150px;
  height: 40px;
  border-radius: 25px;
  background: #057feb;
  border: none;
  color: white;
}

.to_user_manager {
  color: #057feb;
  margin-top: 14px;
  cursor: pointer;
}

.form-input {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  align-items: center;
}

.input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}

.button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 0 4px 4px 0;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}

.form-input span {
  padding-bottom: 3px;
}

input {
  padding: 10px 15px;
  font-size: 16px;
  color: #333;
  background: #f9f9f9;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:focus {
  border-color: #4a90e2;
  background: #fff;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.5);
}

input::placeholder {
  color: #aaa;
  font-style: italic;
}

input:hover {
  border-color: #bbb;
}
</style>

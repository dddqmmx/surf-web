<template>
  <div class="container">
    <div class="login-tabs">
      <span class="login-title">Surf 登录</span>
      <img class="user-avatar" alt="" src="/images/avatar/default-avatar.png" />
      <div class="input-container">
        <span>账号</span>
        <input v-model="account" class="input" type="text" />
        <span>密码</span>
        <input v-model="password" class="input" type="password" />
        <label style="vertical-align: middle;">
          <input v-model="rememberMe" type="checkbox" style="vertical-align: middle;" />
          自动登录
        </label>
      </div>
      <button class="login-button" @click="login">登录</button>
      <a class="to_user_manager" @click="router.push('/register')">没有账号?点击注册</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userService } from '@/services/api/user';

const router = useRouter();
const account = ref<string | undefined>();
const password = ref<string | undefined>();
const rememberMe = ref(false);

const login = () => {
  if (rememberMe.value) {
    localStorage.setItem('rememberMe', 'true');
    if (typeof account.value === 'string') {
      localStorage.setItem('username', account.value);
    }
    if (typeof password.value === 'string') {
      localStorage.setItem('password', password.value);
    }
  }
  userService.login(account.value, password.value).subscribe((value) => {
    if (value) {
      router.push('/main/session');
    } else {
      alert('登录失败，账号或密码错误');
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

@media (min-aspect-ratio: 1/1) {
  .info-panel {
    display: block;
  }

  .container {
    justify-content: center;
  }
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

.login-tabs label {
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

.input-container {
  display: flex;
  align-content: start;
  flex-direction: column;
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
  text-decoration-line: none;
}

.input {
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

.input:focus {
  border-color: #4a90e2;
  background: #fff;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.5);
}

.input::placeholder {
  color: #aaa;
  font-style: italic;
}

.input:hover {
  border-color: #bbb;
}

input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
  background-color: #fff;
  transition: all 0.3s ease;
}

input[type='checkbox']:hover {
  border-color: #007bff;
}

input[type='checkbox']:checked {
  background-color: #007bff;
  border-color: #007bff;
}

input[type='checkbox']:checked::after {
  content: '✔';
  font-size: 14px;
  color: #fff;
  display: block;
  text-align: center;
  line-height: 18px;
}
</style>

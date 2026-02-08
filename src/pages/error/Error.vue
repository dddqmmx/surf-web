<template>
  <div class="error-page">
    <div>
      <p class="title">Surf KIWAMI</p>
      <p>未知访问路径，没有这个页面</p>
      <button @click="toLogin">点击前往登录页面</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const toLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.error-page {
  background-color: #f0f2f5;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.error-page > div {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  font-size: 24px;
  color: #333333;
  margin-bottom: 20px;
  font-weight: bold;
}

p {
  font-size: 16px;
  color: #333333;
  margin-bottom: 20px;
}

button {
  background-color: #007bff;
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}
</style>

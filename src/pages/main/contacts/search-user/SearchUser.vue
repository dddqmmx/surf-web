<template>
  <div class="search-root">
    <div class="search-container">
      <div class="search-bar">
        <p class="search-title">搜索用户</p>
        <div class="search-input">
          <input v-model="userId" type="text" placeholder="输入用户Id查询" />
          <button @click="searchUser">搜索</button>
        </div>
      </div>
      <div>
        <div v-for="id in userList" :key="id" class="message">
          <Avatar class="avatar" :id="id" type="user" />
          <div class="message-content">
            <p class="username">{{ userStore.userInfoIndexById[id]?.data?.nickname || id }}</p>
            <p class="text">{{ userStore.userInfoIndexById[id]?.data?.introduction || id }}</p>
          </div>
          <button class="agree-button" @click="sendFriendRequest(id)">添加好友</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Avatar from '@/components/Avatar.vue';
import { requestService } from '@/services/request';
import { userStore } from '@/services/state';

const userId = ref('');
const result = ref<any>(null);
const userList = ref<string[]>([]);

const searchUser = () => {
  requestService.getUserInfo([userId.value]).then((response) => {
    result.value = response;
    userList.value = Array.from(response.keys());
  });
};

const sendFriendRequest = (targetUserId: string) => {
  requestService.sendFriendRequest(targetUserId).then((response) => {
    if (response) {
      alert('添加成功');
    } else {
      alert('你无法发送好友请求');
    }
  });
};
</script>

<style scoped>
.search-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-position: center center;
  background-size: cover;
  background-image: url('/images/background/user_info.jpg');
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

.search-container {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 90%;
  max-width: 500px;
}

.search-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input input[type='text'] {
  flex: 1;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s ease;
}

.search-input input[type='text']:focus {
  outline: none;
  border-color: #007bff;
}

.search-input button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-input button:hover {
  background-color: #0056b3;
}

.search-input button:active {
  background-color: #004080;
}

.message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: box-shadow 0.3s ease;
}

.message:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.username {
  font-weight: bold;
  font-size: 1.2em;
  margin: 0;
  color: #007bff;
}

.text {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.9em;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agree-button {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.agree-button:hover {
  background-color: #218838;
}

.agree-button:active {
  background-color: #1e7e34;
}
</style>

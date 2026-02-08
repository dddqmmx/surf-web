<template>
  <div class="friend-request-root">
    <div class="chat-container">
      <div v-for="userId in friendRequests" :key="userId" class="message">
        <img class="avatar" src="/images/avatar/default-avatar.png" alt="头像" />
        <div class="message-content">
          <p class="username">{{ userStore.userInfoIndexById[userId]?.data?.nickname || userId }}</p>
          <p class="text">{{ userStore.userInfoIndexById[userId]?.data?.introduction || userId }}</p>
        </div>
        <button class="agree-button" @click="acceptFriendRequest(userId)">同意</button>
      </div>
      <div v-if="friendRequests.length === 0" class="message">
        <p>没有</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { requestService } from '@/services/request';
import { userStore } from '@/services/state';

const friendRequests = ref<string[]>([]);

onMounted(() => {
  requestService.getFriendRequests().then((user_ids) => {
    friendRequests.value = user_ids;
    requestService.getUserInfo(user_ids).then();
  });
});

const acceptFriendRequest = (userId: string) => {
  requestService.requestAcceptFriendRequest(userId).then((response) => {
    if (response) {
      friendRequests.value = friendRequests.value.filter((item) => item !== userId);
      alert('成功同意好友请求');
    } else {
      alert('出错');
    }
  });
};
</script>

<style scoped>
.friend-request-root {
  display: flex;
  width: 100%;
  height: 100%;
  background-size: cover;
  background: #c7c7c7 center center;
}

.chat-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #eaeaea;
}

.message:last-child {
  border-bottom: none;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.username {
  font-weight: bold;
  font-size: 1.1em;
  margin: 0;
  color: #333;
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
  margin-left: 100px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.agree-button:hover {
  background-color: #0056b3;
}

.agree-button:active {
  background-color: #004080;
}
</style>

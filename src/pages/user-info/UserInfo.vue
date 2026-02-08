<template>
  <div class="user-info-root">
    <div class="container">
      <div class="user-info-container">
        <div class="user-info">
          <Avatar class="avatar" :id="user" type="user" />
          <div class="user-info-context">
            <span class="username">{{ userStore.userInfoIndexById[user]?.data?.nickname }}</span>
            <span class="user_id">用户ID: {{ userStore.userInfoIndexById[user]?.data?.user_id }}</span>
          </div>
        </div>
        <div class="self-introduction-container">
          <div>
            <pre>{{ userStore.userInfoIndexById[user]?.data?.introduction }}</pre>
          </div>
        </div>
        <div class="option-button-container">
          <template v-if="user !== authState.clientUserId">
            <button class="btn">分享</button>
            <button class="btn">语音聊天</button>
            <button class="btn">发消息</button>
          </template>
          <template v-else>
            <button class="btn" @click="toUserProfileEditor">编辑资料</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Avatar from '@/components/Avatar.vue';
import { authState, userStore } from '@/services/state';
import { requestService } from '@/services/request';

const route = useRoute();
const router = useRouter();
const user = ref('');

const updateUser = (userId?: string | string[]) => {
  if (typeof userId === 'string') {
    user.value = userId;
    if (!userStore.userInfoIndexById[userId]) {
      requestService.getUserInfo([userId]).then();
    }
  }
};

onMounted(() => {
  updateUser(route.query.user_id);
});

watch(
  () => route.query.user_id,
  (value) => updateUser(value)
);

const toUserProfileEditor = () => {
  router.push('/main/user_profile_editor');
};
</script>

<style scoped>
.user-info-root {
  display: flex;
  width: 100%;
  height: 100%;
}

.container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-position: center center;
  background-size: cover;
  background-image: url('/images/background/user_info.jpg');
  background-color: rgba(0, 0, 0, 0.1);
  background-blend-mode: darken;
}

.user-info-container {
  margin: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
}

.user-info {
  display: flex;
}

.user-info-context {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  justify-content: center;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 10px;
}

.user_id {
  margin-top: 1rem;
  text-overflow: ellipsis;
}

.self-introduction-container {
  color: #ffffff;
  border-radius: 10px;
  margin-top: 20px;
  background: #3498db;
  padding: 10px;
}

.option-button-container {
  margin-top: 20px;
  display: flex;
  width: 100%;
  justify-content: center;
}

.btn {
  background-color: #3498db;
  color: #ffffff;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;
  margin-left: 10px;
  transition: background-color 0.3s ease;
}
</style>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="icon-close-btn" aria-label="关闭" @click="onClose">&times;</button>
      <h2>邀请好友</h2>
      <p>选择一个好友发送邀请：</p>
      <ul class="friend-list">
        <li v-for="friendId in userStore.friends" :key="friendId" class="friend-item">
          <Avatar type="user" :id="friendId" class="avatar" />
          <span class="nickname">{{ userStore.userInfoIndexById[friendId]?.data?.nickname || friendId }}</span>
          <button class="invite-btn" @click="invite(friendId)">邀请</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Avatar from './Avatar.vue';
import { userStore } from '@/services/state';
import { requestService } from '@/services/request';

const props = defineProps<{
  serverId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

onMounted(() => {
  requestService.getUserFriends().then((user_ids) => {
    requestService.getUserInfo(user_ids).then();
  });
});

const invite = (friendId: string) => {
  requestService.requestInviteUsers(props.serverId, [friendId]).then((response) => {
    if (response) {
      alert('邀请成功，该用户成功加入服务器');
    } else {
      alert('邀请失败');
    }
  });
};

const onClose = () => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 24px 24px 16px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.icon-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
}

.icon-close-btn:hover {
  color: #000;
}

.friend-list {
  width: 100%;
  list-style: none;
  padding: 0;
  margin-top: 16px;
}

.friend-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.friend-item .avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  margin-right: 12px;
}

.friend-item .nickname {
  flex-grow: 1;
  text-align: left;
}

.friend-item .invite-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.friend-item .invite-btn:hover {
  background-color: #0056b3;
}
</style>

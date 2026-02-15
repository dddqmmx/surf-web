<template>
  <div class="contact-list">
    <div class="sidebar">
      <div class="search-bar">
        <input type="text" placeholder="搜索联系人..." class="search-input" />
      </div>
      <div class="action-buttons">
        <button class="btn add-contact" @click="viewSearchUser">添加联系人</button>
        <button class="btn friend-requests" @click="viewFriendRequests">好友申请列表</button>
      </div>
      <div class="contact-items">
        <div v-for="friendId in userStore.friends" :key="friendId" class="contact-item" @click="viewContacts(friendId)">
          <Avatar class="avatar" :id="friendId" type="user" />
          <span class="contact-name">{{ userStore.userInfoIndexById[friendId]?.data?.nickname || friendId }}</span>
        </div>
      </div>
    </div>
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import Avatar from '@/components/Avatar.vue';
import { requestService } from '@/services/api/request';
import { userStore } from '@/services/state';

const router = useRouter();

const viewContacts = (userId: string) => {
  router.push({ path: '/main/contacts/user_info', query: { user_id: userId } });
};

const viewSearchUser = () => {
  router.push('/main/contacts/search_user');
};

const viewFriendRequests = () => {
  router.push('/main/contacts/friend_request_list');
};

onMounted(() => {
  requestService.getUserFriends().then((user_ids) => {
    requestService.getUserInfo(user_ids).then();
  });
});
</script>

<style scoped>
.contact-list {
  width: 100%;
  display: flex;
  height: 100%;
}

@media (max-aspect-ratio: 1/1) {
  .layout-container {
    flex-direction: column;
    height: auto;
  }

  .sidebar {
    width: 100%;
    height: 100%;
  }

  .main-content {
    width: 100%;
  }
}

.sidebar {
  box-sizing: border-box;
  background-color: var(--color-bg-sidebar);
  color: var(--color-text-inverse);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.main-content {
  width: 100%;
  flex: 1;
  background-color: var(--color-bg-main);
}

.search-bar {
  flex: 0 0 auto;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  color: var(--color-text-primary);
  background-color: var(--color-bg-panel-subtle);
}

.action-buttons {
  display: flex;
  flex-direction: column;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-contact {
  background-color: var(--color-primary-strong);
  color: var(--color-text-inverse);
}

.add-contact:hover {
  background-color: var(--color-primary-hover);
}

.friend-requests {
  margin-top: 5px;
  background-color: var(--color-warning);
  color: var(--color-text-inverse);
}

.friend-requests:hover {
  background-color: var(--color-warning-hover);
}

.contact-items {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background-color: var(--color-bg-sidebar-elevated);
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.contact-item:hover {
  background-color: var(--color-bg-sidebar-hover);
}

.avatar {
  height: 32px;
  width: 32px;
  border-radius: 10px;
  margin-right: 10px;
}

.contact-name {
  font-size: 16px;
  color: var(--color-text-inverse);
}
</style>

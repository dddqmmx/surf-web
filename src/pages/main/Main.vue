<template>
  <div class="container">
    <div v-if="layoutState.persistent" class="sidebar">
      <div class="user-options">
        <Avatar class="avatar" :id="authState.clientUserId" type="user" @click="toUserInfo" />
        <template v-for="option in options" :key="option.name">
          <img
            class="icon"
            :class="{ selected: selectedOption === option.name }"
            :alt="option.name"
            :src="option.icon"
            :height="option.height"
            :width="option.width"
            @click="onSelect(option)"
          />
        </template>
      </div>
    </div>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { Subscription } from 'rxjs';
import Avatar from '@/components/Avatar.vue';
import { authState, layoutState, serverStore, userStore } from '@/services/state';
import { socketService } from '@/services/socket';
import { requestService } from '@/services/request';

const router = useRouter();
const subscriptions: Subscription[] = [];

const options = [
  { name: 'chat', icon: '/images/icon/chat_bubble.svg', height: 38, width: 38 },
  { name: 'channels', icon: '/images/icon/campaign.svg', height: 38, width: 38 },
  { name: 'person', icon: '/images/icon/person.svg', height: 38, width: 38 },
  { name: 'call', icon: '/images/icon/call.svg', height: 38, width: 38 },
  { name: 'settings', icon: '/images/icon/settings.svg', height: 38, width: 38 },
];

const selectedOption = ref('chat');

const onSelect = (option: any) => {
  selectedOption.value = option.name;
  switch (option.name) {
    case 'channels':
      router.push('/main/channels');
      break;
    case 'userInfo':
      router.push('/main/user_info');
      break;
    case 'chat':
      router.push('/main/session');
      break;
    case 'settings':
      router.push('/main/settings');
      break;
    case 'person':
      router.push('/main/contacts');
      break;
    default:
      break;
  }
};

onMounted(() => {
  requestService.getUserInfo([authState.clientUserId]).then();

  const newServerSubject = socketService.getMessageSubject('server', 'new_server').subscribe((message) => {
    const server_id = message['server_id'];
    serverStore.servers.push(server_id);
    requestService.requestServerInfoByIds([server_id]);
  });
  subscriptions.push(newServerSubject);

  const newFriendSubject = socketService.getMessageSubject('user', 'new_friend').subscribe((message) => {
    const user_id = message['user_id'];
    userStore.friends.push(user_id);
    requestService.getUserInfo([user_id]).then();
  });
  subscriptions.push(newFriendSubject);
});

onBeforeUnmount(() => {
  subscriptions.forEach((subscription) => subscription.unsubscribe());
});

const toUserInfo = () => {
  router.push({ path: '/main/user_info', query: { user_id: authState.clientUserId } });
  selectedOption.value = '';
};
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.sidebar {
  display: flex;
}

.avatar {
  width: 48px;
}

.icon {
  margin-top: 1rem;
  background: #3b96ff;
  border-radius: 10px;
  padding: 5px;
}

.selected {
  background-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.user-options {
  overflow-y: scroll;
  padding: 0.5rem;
  background-color: #007bff;
  display: flex;
  flex-direction: column;
}

.user-options::-webkit-scrollbar {
  display: none;
}

.content {
  background: white;
  flex: 1;
  display: flex;
}

.channel:hover {
  background-color: #e65c00;
}
</style>

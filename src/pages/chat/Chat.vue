<template>
  <div class="container">
    <div class="chat-header">
      <img
        v-if="uiState.isMobile"
        id="back"
        alt="back"
        height="24"
        src="/images/icon/arrow_back.svg"
        width="24"
        @click="back"
      />
      <span class="session-name" style="margin: 0;">{{ sessionName }}</span>
    </div>
    <div class="main">
      <div class="chat-area">
        <div ref="chatContent" class="chat-content" @scroll="onScroll">
          <div class="message-list">
            <div
              v-for="message in messageList"
              :key="message['_id']?.['$oid'] || message['id'] || message['chat_time']?.['$date']?.['$numberLong'] || Math.random()"
              :class="message['user_id'] !== authState.clientUserId ? 'message-container' : 'message-right-container'"
            >
              <Avatar
                v-if="message['user_id'] !== authState.clientUserId"
                :id="message['user_id']"
                type="user"
                class="avatar"
              />
              <div class="message-content">
                <span class="username">
                  {{ userStore.userInfoIndexById[message['user_id']]?.data?.nickname || message['user_id'] }}
                </span>
                <pre v-if="message['type'] === 'text'" class="message">{{ message['content'] }}</pre>
                <ChatImage
                  v-if="message['type'] === 'img'"
                  class="message image"
                  :w="message['w']"
                  :h="message['h']"
                  :image="message['content']"
                />
              </div>
              <Avatar
                v-if="message['user_id'] === authState.clientUserId"
                :id="message['user_id']"
                type="user"
                class="avatar"
              />
            </div>
          </div>
        </div>
        <div class="chat-input">
          <div>
            <img alt="" class="input-option" height="24" src="/images/icon/mic.svg" width="24" />
            <img
              alt=""
              class="input-option"
              height="24"
              src="/images/icon/photo_library.svg"
              width="24"
              @click="selectImage"
            />
            <img alt="" class="input-option" height="24" src="/images/icon/folder.svg" width="24" />
          </div>
          <div style="display: flex">
            <textarea
              id="message-input"
              v-model="messageInputValue"
              rows="5"
              placeholder="Type your message..."
              @keyup.enter="sendMessage"
            ></textarea>
          </div>
        </div>
      </div>
      <MemberList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Subscription } from 'rxjs';
import Avatar from '@/components/Avatar.vue';
import ChatImage from '@/components/ChatImage.vue';
import MemberList from '@/components/MemberList.vue';
import { requestService } from '@/services/request';
import { socketService } from '@/services/socket';
import { authState, layoutState, serverStore, uiState, userStore } from '@/services/state';
import { chatService } from '@/services/api/chat';

const route = useRoute();
const router = useRouter();

const subscriptions: Subscription[] = [];
const sessionName = ref('');
const messageList = ref<any[]>([]);
const sessionId = ref<string | null>(null);
const scrollToBottomFlag = ref(false);
const messageInputValue = ref('');
const chatContent = ref<HTMLElement | null>(null);

const loadChannel = async (channelId: string) => {
  sessionId.value = channelId;
  messageList.value = await requestService.getMessage(channelId);
  const userIds = Array.from(new Set(messageList.value.map((message: any) => message.user_id)));
  await requestService.getUserInfo(userIds);
  sessionName.value = serverStore.getChannelInfoById(channelId)?.['channel_name'] || '';
  scrollToBottomFlag.value = true;
};

onMounted(() => {
  const newMessageSub = socketService.getMessageSubject('chat', 'new_message').subscribe((message) => {
    requestService.getUserInfo([message['user_id']]).then();
    messageList.value.push(message);
    scrollToBottomFlag.value = true;
  });
  subscriptions.push(newMessageSub);

  const channelId = route.query.channel_id;
  if (typeof channelId === 'string') {
    loadChannel(channelId).then();
  }
});

watch(
  () => route.query.channel_id,
  (channelId) => {
    if (typeof channelId === 'string') {
      loadChannel(channelId).then();
    }
  }
);

watch(
  () => scrollToBottomFlag.value,
  async (flag) => {
    if (flag) {
      await nextTick();
      scrollToBottom();
      scrollToBottomFlag.value = false;
    }
  }
);

onBeforeUnmount(() => {
  subscriptions.forEach((subscription) => subscription.unsubscribe());
});

const selectImage = async () => {
  try {
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'Images',
          accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
          },
        },
      ],
      multiple: false,
    });

    const file = await fileHandle.getFile();
    const dimensions = await getImageSize(file);
    sendImage(file, dimensions.width, dimensions.height);
  } catch (error) {
    console.error('文件选择已取消', error);
  }
};

const getImageSize = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const onScroll = (event: Event) => {
  const element = event.target as HTMLElement;
  if (element.scrollTop === 0) {
    const previousHeight = element.scrollHeight;
    getMessageFromHistory();
    const newHeight = element.scrollHeight;
    element.scrollTop = newHeight - previousHeight;
  }
};

const getMessageFromHistory = () => {
  if (sessionId.value) {
    requestService.getMessage(sessionId.value, messageList.value[0]).then((r) => {
      messageList.value = r.concat(messageList.value);
    });
  }
};

const sendImage = (imageFile: File, w: number, h: number) => {
  chatService.uploadImage(imageFile).then((hash) => {
    if (hash) {
      chatService.sendImage(sessionId.value, hash, w, h).then();
    }
  });
};

const sendMessage = () => {
  const trimmedMessage = messageInputValue.value.trim();
  if (trimmedMessage !== '') {
    requestService.sendMessage(sessionId.value, trimmedMessage);
    messageInputValue.value = '';
    scrollToBottomFlag.value = true;
  }
};

const scrollToBottom = () => {
  if (chatContent.value) {
    const element = chatContent.value;
    element.scrollTop = element.scrollHeight;
  }
};

const back = () => {
  layoutState.persistent = true;
  layoutState.secondary = true;
  layoutState.primary = false;
  router.push('/main/session');
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

@media (max-aspect-ratio: 1/1) {
  #back {
    display: block;
  }
}

.chat-header {
  background-color: #5fa7ff;
  border-bottom: #acacac 2px solid;
  color: white;
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.session-name {
  text-align: center;
  flex-grow: 1;
  margin: 0;
}

.chat-header img {
  cursor: pointer;
}

.main {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-content {
  overflow-y: auto;
  flex: 1;
  padding: 10px;
  background-color: #ffffff;
}

.chat-content::-webkit-scrollbar {
  width: 8px;
}

.chat-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
  border-radius: 4px;
  transition: background-color 0.3s;
}

.chat-content:hover::-webkit-scrollbar-thumb,
.chat-content:active::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
}

.chat-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0) transparent;
}

.chat-content:hover {
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.message-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.message-container {
  display: flex;
  margin-bottom: 10px;
  width: 100%;
}

.message-right-container {
  display: flex;
  margin-bottom: 10px;
  width: 100%;
  justify-content: flex-end;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 10px;
}

.message-container .avatar {
  margin-right: 10px;
}

.message-right-container .avatar {
  margin-left: 10px;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 50%;
  width: fit-content;
  flex-grow: 0;
}

.message {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  word-wrap: break-word;
  display: block;
  white-space: pre-wrap;
  max-width: 100%;
}

.message-container .message {
  background: #f0f0f0;
  align-self: flex-start;
  display: inline-block;
}

.message-container .message-content {
  align-items: flex-start;
}

.message-right-container .message-content {
  align-items: flex-end;
}

.message-right-container .message {
  background: #007bff;
  color: white;
  align-self: flex-end;
  display: inline-block;
}

.username {
  font-size: 12px;
  font-weight: bold;
  color: #333333;
}

.chat-input {
  display: flex;
  gap: 5px;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  flex-direction: column;
  flex-shrink: 0;
}

#message-input {
  flex-grow: 1;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  outline: none;
  resize: none;
}

#send-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

#send-button:hover {
  background-color: #0056b3;
}

.input-option {
  margin-right: 0.5rem;
}
</style>

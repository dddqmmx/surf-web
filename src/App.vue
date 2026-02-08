<template>
  <div class="app-container">
    <div v-if="loadingFlag" class="loading-background">
      <img class="loading-icon" alt="" src="/logo.png" />
      <p class="loading-text">加载中</p>
    </div>
    <div v-else class="content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import { Subscription } from 'rxjs';
import { networkConfig, uiState } from '@/services/state';
import { socketService } from '@/services/socket';
import { voiceChatService } from '@/services/voice-chat';

const loadingFlag = ref(true);
const remoteAudios = new Map<string, HTMLAudioElement>();

let mediaQuery: MediaQueryList | null = null;
let updateIsMobile: (() => void) | null = null;
let remoteStreamSub: Subscription | null = null;
let remoteLeaveSub: Subscription | null = null;

const setupMobileDetection = () => {
  mediaQuery = window.matchMedia('(max-aspect-ratio: 1/1)');
  updateIsMobile = () => {
    uiState.isMobile = mediaQuery?.matches ?? false;
  };
  updateIsMobile();
  mediaQuery.addEventListener('change', updateIsMobile);
};

onMounted(() => {
  setupMobileDetection();
  networkConfig.host = window.location.hostname;
  networkConfig.sslEnabled = window.location.protocol === 'https:';

  socketService
    .initializeMainConnection(networkConfig.websocketUrl)
    .then(() => {
      loadingFlag.value = false;
    })
    .catch((err) => {
      console.error(err);
    });

  remoteStreamSub = voiceChatService.onRemoteStream.subscribe(({ userId, stream }) => {
    let audio = remoteAudios.get(userId);
    if (!audio) {
      audio = document.createElement('audio');
      audio.autoplay = true;
      remoteAudios.set(userId, audio);
      document.body.appendChild(audio);
    }
    audio.srcObject = stream;
  });

  remoteLeaveSub = voiceChatService.onRemoteLeave.subscribe(({ userId }) => {
    const audio = remoteAudios.get(userId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
      remoteAudios.delete(userId);
    }
  });
});

onBeforeUnmount(() => {
  if (mediaQuery && updateIsMobile) {
    mediaQuery.removeEventListener('change', updateIsMobile);
  }
  remoteStreamSub?.unsubscribe();
  remoteLeaveSub?.unsubscribe();
  for (const audio of remoteAudios.values()) {
    audio.pause();
    audio.srcObject = null;
    audio.remove();
  }
  remoteAudios.clear();
});
</script>

<style scoped>
.loading-background {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-position: center center;
  background-size: cover;
  background-image: url('/images/background/user_info.jpg');
  background-color: rgba(0, 0, 0, 0.5);
  background-blend-mode: darken;
}

.loading-icon {
  border: 2px solid black;
  width: 10%;
}

.loading-text {
  color: white;
  margin-top: 20px;
  font-size: 50px;
  text-shadow: #000 2px 0 0, #000 0 2px 0, #000 -2px 0 0, #000 0 -2px 0;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}

.content {
  height: 100dvh;
}
</style>

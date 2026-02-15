<template>
  <div class="session-root">
    <div class="layout-container">
      <div class="session-list">
        <SessionList />
        <div class="vc-container">
          <div v-if="voiceState.voiceChatting" class="vc-info-container">
            <div class="vc-info">
              <p>通话中</p>
              <p>
                {{ serverStore.getServerInfoById(serverStore.currentServer)?.name }} /
                {{ serverStore.getChannelInfoById(voiceState.voiceChannel)?.channel_name }}
              </p>
            </div>
            <div class="vc-opt">
              <img class="icon" src="/images/icon/phone_disabled.svg" @click="stopVoiceChat" />
            </div>
          </div>
          <div class="vc-settings-container">
            <img
              class="icon"
              src="/images/icon/mic.svg"
              :class="{ disabled: !devicePreferences.micEnabled }"
              @click="devicePreferences.toggleMic()"
            />
            <img
              class="icon"
              src="/images/icon/volume.svg"
              :class="{ disabled: !devicePreferences.speakerEnabled }"
              @click="devicePreferences.toggleSpeaker()"
            />
          </div>
        </div>
      </div>
      <div  id="chat" class="router-container">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import SessionList from '@/components/SessionList.vue';
import { devicePreferences, serverStore, voiceState } from '@/services/state';
import { requestService } from '@/services/api/request';
import { voiceChatService } from '@/services/voice-chat';

const route = useRoute();

onMounted(() => {
  requestService.requestUserServers();
});

const stopVoiceChat = () => {
  voiceState.voiceChatting = false;
  voiceState.voiceChannel = '';
  voiceChatService.stop();
};
</script>

<style scoped>
.session-root {
  display: flex;
  width: 100%;
  height: 100%;
}

.hidden {
  display: none;
}

@media (max-aspect-ratio: 1/1) {
  .layout-container {
    flex-direction: column;
    height: auto;
  }

  .router-container {
    width: 100%;
    height: 100%;
  }

  .vc-info-container {
    width: 100%;
  }
}

.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.session-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-panel-muted);
  width: 15%;
  min-width: 250px;
}

.router-container {
  flex: 1;
  overflow: auto;
}

.vc-container {
  color: var(--color-text-inverse);
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-sidebar-elevated);
}

.vc-info-container {
  box-sizing: border-box;
  padding-left: 10px;
  padding-right: 10px;
  border-top: 0.1rem solid var(--color-primary-strong);
  display: flex;
  flex-direction: row;
  align-items: center;
}

.vc-info {
  flex-grow: 1;
}

.vc-opt {
  margin-left: 15px;
  align-items: center;
}

.vc-settings-container {
  padding: 0.3rem;
  border-top: 0.1rem solid var(--color-primary-strong);
  display: flex;
  justify-content: flex-end;
}

.icon {
  width: 24px;
}

.icon.disabled {
  opacity: 0.45;
  filter: grayscale(1);
}
</style>

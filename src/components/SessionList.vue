<template>
  <div class="session-list">
    <template v-if="!serverStore.currentServer">
      <div
        v-for="sid in serverStore.servers"
        :key="sid"
        class="session"
        @click="selectServer(sid)"
      >
        <Avatar class="session-icon" type="server" :id="sid" />
        <span>{{ serverStore.getServerInfoById(sid)?.name || 'loading' }}</span>
      </div>
    </template>

    <div v-else>
      <div class="channel-title">
        <img id="back" alt="back" height="24" src="/images/icon/arrow_back.svg" width="24" @click="backToSessionList" />
        <span class="server-name" @click="toggleMenu($event)">{{ serverService.serverInfo?.name }}</span>
        <div class="context-menu" :class="{ show: isMenuOpen }">
          <div
            v-if="serverService.currentRolePermissions.includes(1)"
            class="menu-item"
            @click="handleMenuClick('settings')"
          >
            <span>服务器设置</span>
            <i class="icon-cog"></i>
          </div>
          <div class="menu-item" @click="handleMenuClick('invite')">
            <span>邀请用户</span>
            <i class="icon-user-plus"></i>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item danger" @click="handleMenuClick('leave')">
            <span>离开服务器</span>
            <i class="icon-exit"></i>
          </div>
        </div>
      </div>

      <div class="channel-list">
        <div v-for="group in serverService.serverInfo?.channels || []" :key="group.group_id || group.group_name" class="channel-group">
          <h3 class="channel-group-title">{{ group['group_name'] }}</h3>
          <ul class="channel-group-list">
            <template v-for="channel in group['channels']" :key="channel['channel_id']">
              <li class="channel" @click="toChat(channel['channel_id'], channel['channel_type'])">
                <img v-if="channel['channel_type'] === 'text'" src="/images/icon/text_chat.svg" class="icon" alt="" />
                <img v-if="channel['channel_type'] === 'voice'" src="/images/icon/voice_chat.svg" class="icon" alt="" />
                {{ channel['channel_name'] }}
              </li>
              <ul v-if="channel['channel_type'] === 'voice'" class="voice-user-list">
                <li v-for="member in membersFromChannels[channel['channel_id']] || []" :key="member.user_id + member.client_id" class="voice-user">
                  <Avatar class="user-avatar" :id="member.user_id" type="user" />
                  <span>{{ userStore.userInfoIndexById[member.user_id]?.data?.nickname || member.user_id }}</span>
                </li>
              </ul>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <InviteDialog v-if="inviteDialog" :serverId="selectedServerId" @close="toggleInviteDialog" />
  <ServerSettingDialog v-if="serverSettingDialog" :serverId="selectedServerId" @close="toggleServerSettingDialog" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Subscription } from 'rxjs';
import { authState, layoutState, serverStore, uiState, userStore, voiceState } from '@/services/state';
import { requestService } from '@/services/request';
import { socketService } from '@/services/socket';
import { voiceChatService } from '@/services/voice-chat';
import { serverService } from '@/services/api/server';
import Avatar from './Avatar.vue';
import InviteDialog from './InviteDialog.vue';
import ServerSettingDialog from './ServerSettingDialog.vue';

const router = useRouter();
const selectedServerId = ref('');
const membersFromChannels = ref<Record<string, any[]>>({});
const subscriptions: Subscription[] = [];

const isMenuOpen = ref(false);
const inviteDialog = ref(false);
const serverSettingDialog = ref(false);

const toggleMenu = (event?: MouseEvent) => {
  event?.stopPropagation();
  isMenuOpen.value = !isMenuOpen.value;
};

const handleMenuClick = (action: string) => {
  isMenuOpen.value = false;
  if (action === 'invite') {
    toggleInviteDialog();
    return;
  }
  if (action === 'settings') {
    toggleServerSettingDialog();
    return;
  }
  if (action === 'leave') {
    leaveDialog();
  }
};

const toggleInviteDialog = () => {
  inviteDialog.value = !inviteDialog.value;
};

const toggleServerSettingDialog = () => {
  serverSettingDialog.value = !serverSettingDialog.value;
};

const leaveDialog = () => {
  if (!confirm('确认要离开该服务器吗？')) {
    return;
  }
  serverService.leaveServer(selectedServerId.value);
  serverStore.servers = serverStore.servers.filter((item) => item !== selectedServerId.value);
  serverStore.currentServer = '';
  router.push('/main/session');
};

const subscribeToMemberEvents = (serverId: string) => {
  const userJoinSub = socketService.getMessageSubject('server', 'user_join').subscribe(async (message) => {
    const user_ids = message['user_ids'];
    requestService.getUserInfo(user_ids).then();
    const memberRolesRecord = await serverService.getMembersRoles(serverId, user_ids);
    serverService.addUsers(user_ids, memberRolesRecord);
  });
  subscriptions.push(userJoinSub);

  const userLeaveSub = socketService.getMessageSubject('server', 'user_leave').subscribe((message) => {
    const user_id = message['user_id'];
    serverService.removeUser(user_id);
  });
  subscriptions.push(userLeaveSub);
};

const getMemberRoles = async (serverId: string): Promise<Record<string, string[]>> => {
  const memberIds = await serverService.getServerMemberIds(serverId);
  return serverService.getMembersRoles(serverId, memberIds);
};

const getServerRoles = async (serverId: string) => {
  return serverService.getServerRoles(serverId);
};

const selectServer = async (serverId: string) => {
  selectedServerId.value = serverId;
  serverStore.currentServer = serverId;
  await getServerChannels(serverId);
  await getMemberAndRoles(serverId);
  subscribeToMemberEvents(serverId);
};

const getServerChannels = async (serverId: string) => {
  const channelsData = await requestService.getServerChannels(serverId);
  const voiceChannelIds = channelsData.flatMap((group: { channels: any[] }) =>
    group.channels.filter((channel) => channel.channel_type === 'voice').map((channel) => channel.channel_id)
  );
  requestService.requestConnectToServerEventChannel(serverId).then(() => {
    requestService.getMembersFromVoiceChannels(voiceChannelIds).then((r) => {
      for (const [, members] of Object.entries(r)) {
        if (Array.isArray(members)) {
          requestService.getUserInfo(members.map((member: { user_id: string }) => member.user_id));
        }
      }
      membersFromChannels.value = r as Record<string, any[]>;
    });
  });
  serverService.serverInfo = serverStore.getServerInfoById(serverId);
};

const getMemberAndRoles = async (serverId: string) => {
  const [memberIds, memberRolesRecord, rolesRecord] = await Promise.all([
    serverService.getServerMemberIds(serverId),
    getMemberRoles(serverId),
    getServerRoles(serverId),
  ]);

  serverService.updateMemberData({
    memberIds,
    memberRolesRecord,
    rolesRecord,
  });

  serverService.currentRolePermissions = serverService.getUserPermissions(authState.clientUserId);
};

const backToSessionList = () => {
  requestService.requestDisconnectToServerEventChannel(selectedServerId.value).then();
  serverService.serverInfo = undefined;
  serverStore.currentServer = '';
  router.push('/main/session');
  isMenuOpen.value = false;
};

const toChat = async (channelId: any, channelType: any) => {
  if (channelType === 'text') {
    router.push({ path: '/main/session/chat', query: { channel_id: channelId } });
    if (uiState.isMobile) {
      layoutState.persistent = false;
      layoutState.secondary = false;
      layoutState.primary = true;
    } else {
      layoutState.primary = true;
    }
  } else if (channelType === 'voice') {
    const connected = await requestService.requestConnectToVoiceChannel(channelId);
    if (connected) {
      const members = membersFromChannels.value[channelId] || [];
      voiceChatService.initializeRecorder(channelId).then(() => {
        voiceState.voiceChatting = true;
        voiceState.voiceChannel = channelId;
        for (const member of members) {
          if (member.user_id === authState.clientUserId) {
            continue;
          }
          voiceChatService.join(member.user_id, member.client_id);
        }
      });
    }
  }
};

onMounted(() => {
  const serverEventSubject = socketService.getMessageSubject('server', 'server_event').subscribe((message) => {
    if (message['type'] === 'user_join_voice_channel') {
      const channelId = message['channel_id'];
      const userId = message['user_id'];
      const clientId = message['client_id'];
      const existing = membersFromChannels.value[channelId] || [];
      if (!existing.some((m: { user_id: string; client_id: string }) => m.user_id === userId && m.client_id === clientId)) {
        existing.push({ user_id: userId, client_id: clientId });
      }
      membersFromChannels.value[channelId] = existing;
      requestService.getUserInfo([userId]).then();
    }

    if (message['type'] === 'user_leave_voice_channel') {
      const channelId = message['channel_id'];
      const userId = message['user_id'];
      voiceChatService.leave(userId);
      if (membersFromChannels.value[channelId]) {
        membersFromChannels.value[channelId] = membersFromChannels.value[channelId].filter(
          (m: { user_id: string }) => m.user_id !== userId
        );
        if (membersFromChannels.value[channelId].length === 0) {
          delete membersFromChannels.value[channelId];
        }
      }
    }
  });
  subscriptions.push(serverEventSubject);
});

onBeforeUnmount(() => {
  subscriptions.forEach((subscription) => subscription.unsubscribe());
  serverStore.currentServer = '';
});
</script>

<style scoped>
@import url('./session-list.css');
</style>

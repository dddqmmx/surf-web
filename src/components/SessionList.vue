<template>
  <div class="session-list">
    <!-- 服务器列表展示 -->
    <template v-if="!serverStore.currentServer">
      <div class="session-header">
        <span>服务器列表</span>
      </div>
      <div class="session-scroll-area hidden-scrollbar">
        <div
          v-for="sid in serverStore.servers"
          :key="sid"
          class="session-card glass-panel"
          @click="selectServer(sid)"
        >
          <Avatar class="session-icon" type="server" :id="sid" />
          <div class="session-info">
            <span class="session-name">{{ serverStore.getServerInfoById(sid)?.name || 'Loading...' }}</span>
          </div>
          <i class="icon-chevron-right op-50"></i>
        </div>
      </div>
    </template>

    <!-- 频道展示 -->
    <div v-else class="channel-container">
      <div class="channel-header">
        <div class="header-left icon-btn" @click="backToSessionList">
          <img id="back" alt="back" src="/images/icon/arrow_back.svg" />
        </div>
        <div class="server-selector" :class="{ 'menu-active': isMenuOpen }" @click="toggleMenu($event)">
          <span class="server-name">{{ serverService.serverInfo?.name }}</span>
          <i class="icon-arrow-down" :class="{ 'is-active': isMenuOpen }">▼</i>
        </div>

        <!-- 下拉菜单 (添加了 glass-effect 类) -->
        <div class="context-menu glass-effect" :class="{ show: isMenuOpen }">
          <div
            v-if="serverService.currentRolePermissions.includes(1)"
            class="menu-item"
            @click="handleMenuClick('settings')"
          >
            <div class="menu-item-content">
              <i class="icon-cog"></i>
              <span>服务器设置</span>
            </div>
          </div>
          <div class="menu-item" @click="handleMenuClick('invite')">
            <div class="menu-item-content">
              <i class="icon-user-plus"></i>
              <span>邀请用户</span>
            </div>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item danger" @click="handleMenuClick('leave')">
            <div class="menu-item-content">
              <i class="icon-exit"></i>
              <span>离开服务器</span>
            </div>
          </div>
        </div>
      </div>

      <div class="channel-scroll-area hidden-scrollbar">
        <div v-for="group in serverService.serverInfo?.channels || []" :key="group.group_id || group.group_name" class="channel-group">
          <h3 class="channel-group-title">
            <span>{{ group['group_name'] }}</span>
          </h3>
          <div class="channel-group-list">
            <template v-for="channel in group['channels']" :key="channel['channel_id']">
              <div class="channel-item" @click="toChat(channel['channel_id'], channel['channel_type'])">
                <div class="channel-link">
                  <div class="icon-wrapper">
                     <img v-if="channel['channel_type'] === 'text'" src="/images/icon/text_chat.svg" class="channel-icon" />
                     <img v-if="channel['channel_type'] === 'voice'" src="/images/icon/voice_chat.svg" class="channel-icon" />
                  </div>
                  <span class="channel-name">{{ channel['channel_name'] }}</span>
                </div>
              </div>

              <!-- 语音用户列表 -->
              <transition-group name="list-anim" tag="ul" v-if="channel['channel_type'] === 'voice'" class="voice-user-list">
                <li v-for="member in membersFromChannels[channel['channel_id']] || []" :key="member.user_id + member.client_id" class="voice-user">
                  <Avatar class="user-avatar" :id="member.user_id" type="user" />
                  <span class="nickname">{{ userStore.userInfoIndexById[member.user_id]?.data?.nickname || member.user_id }}</span>
                </li>
              </transition-group>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <InviteDialog v-if="inviteDialog" :serverId="selectedServerId" @close="toggleInviteDialog" />
  <ServerSettingDialog v-if="serverSettingDialog" :serverId="selectedServerId" @close="toggleServerSettingDialog" />
</template>

<style scoped>
/* ---------------- 全局容器与基础 ---------------- */
.session-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-sidebar-gradient);
  color: var(--color-text-inverse);
  border-right: 1px solid var(--color-border-on-primary);
  user-select: none;
  overflow: hidden;
  font-family: var(--font-family-base);
}

/* 隐藏滚动条但保留功能 (现代化) */
.hidden-scrollbar {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb-on-primary) transparent;
}
.hidden-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.hidden-scrollbar::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-on-primary);
  border-radius: 4px;
}
.hidden-scrollbar:hover::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-on-primary-hover);
}

/* ---------------- 服务器列表模式 ---------------- */
.session-header {
  padding: 24px 20px 16px;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  opacity: 0.95;
}

.session-card {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: var(--color-bg-sidebar-card);
  border: 1px solid var(--color-border-on-primary);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.session-card:hover {
  background: var(--color-bg-sidebar-card-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.session-card:active {
  transform: scale(0.98);
}

.session-icon {
  height: 42px;
  width: 42px;
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.session-info {
  margin-left: 12px;
  flex: 1;
  overflow: hidden;
}

.session-name {
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}

.op-50 { opacity: 0.5; font-size: 12px; }

/* ---------------- 频道列表 Header ---------------- */
.channel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.channel-header {
  position: relative;
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 0 var(--color-border-on-primary);
  background: var(--color-bg-sidebar-header);
  z-index: 10;
}

.icon-btn {
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  margin-right: 4px;
}
.icon-btn:hover { background: var(--color-bg-sidebar-row-hover); }
.icon-btn img { width: 20px; height: 20px; filter: brightness(100); }

.server-selector {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.server-selector:hover, .server-selector.menu-active {
  background: var(--color-bg-sidebar-row-hover);
}

.server-name {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.icon-arrow-down {
  font-size: 10px;
  opacity: 0.7;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.icon-arrow-down.is-active { transform: rotate(180deg); }

/* ---------------- 下拉菜单 (毛玻璃风格) ---------------- */
.context-menu {
  position: absolute;
  top: 60px;
  left: 12px;
  right: 12px;
  /* 使用深一点的蓝色背景 + 毛玻璃，保证文字可读性 */
  background: var(--color-bg-sidebar-overlay);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border-on-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  padding: 6px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.98);
  transition: all 0.2s cubic-bezier(0.2, 0, 0.13, 1.5);
  z-index: 100;
}

.context-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.menu-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 14px;
}

.menu-item:hover { background: var(--color-primary); }
.menu-item:active { transform: scale(0.98); }

.menu-item-content { display: flex; align-items: center; gap: 10px; }
.menu-item i { font-size: 16px; opacity: 0.9; }

.menu-item.danger { color: var(--color-danger-soft); }
.menu-item.danger:hover { background: var(--color-danger); color: var(--color-text-inverse); }

.menu-divider { height: 1px; background: var(--color-border-on-primary); margin: 4px 6px; }

/* ---------------- 频道列表 ---------------- */
.channel-group { margin-bottom: 24px; }

.channel-group-title {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-inverse-subtle);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
  padding: 0 12px;
  transition: color 0.2s;
}
.channel-group-title:hover { color: var(--color-text-inverse-strong); }

.channel-link {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  margin: 1px 0;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-inverse-muted);
  transition: all 0.2s ease;
}

.channel-link:hover {
  background: var(--color-bg-sidebar-row-hover);
  color: var(--color-text-inverse);
}

.channel-link.active {
  background: var(--color-bg-sidebar-row-active);
  color: var(--color-text-inverse);
  font-weight: 500;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  margin-right: 8px;
}

.channel-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.channel-link:hover .channel-icon { opacity: 1; }

.channel-name {
  font-size: 14px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

/* ---------------- 语音用户列表 ---------------- */
.voice-user-list {
  padding-left: 28px; /* 增加缩进，体现层级 */
  margin: 2px 0 8px 0;
}

.voice-user {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin-top: 2px;
  border-radius: 4px;
  transition: background 0.15s;
  cursor: default;
}

.voice-user:hover {
  background: var(--color-bg-overlay-soft);
}

.user-avatar {
  height: 22px;
  width: 22px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid transparent;
}
.voice-user.speaking .user-avatar { border-color: var(--color-success); }

.nickname {
  font-size: 13px;
  color: var(--color-text-inverse-emphasis);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------------- 动画效果 ---------------- */
.list-anim-enter-active,
.list-anim-leave-active {
  transition: all 0.3s ease;
  max-height: 50px;
}
.list-anim-enter-from,
.list-anim-leave-to {
  opacity: 0;
  transform: translateX(-5px);
  max-height: 0;
  margin: 0;
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Subscription } from 'rxjs';
import { authState, serverStore, userStore, voiceState } from '@/services/state';
import { requestService } from '@/services/api/request';
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

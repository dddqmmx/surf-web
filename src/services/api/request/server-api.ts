import { TimedCache } from '../cache';
import { socketService } from '../../socket';
import { serverStore } from '../../state';

const SERVER_INFO_CACHE_TTL = 10 * 60 * 1000;
const SERVER_CHANNELS_CACHE_TTL = 5 * 60 * 1000;

export class ServerRequestApi {
  private readonly serverInfoCache = new TimedCache<string, any>({
    ttlMs: SERVER_INFO_CACHE_TTL,
    maxSize: 300,
    cleanupIntervalMs: 60 * 1000,
  });

  private readonly serverChannelsCache = new TimedCache<string, any>({
    ttlMs: SERVER_CHANNELS_CACHE_TTL,
    maxSize: 300,
    cleanupIntervalMs: 60 * 1000,
  });

  requestUserServers(): void {
    socketService
      .request('user', 'get_user_servers')
      .then((response) => {
        const serverIds = Array.isArray(response.servers_id) ? response.servers_id : [];
        serverStore.servers = serverIds;
        this.requestServerInfo();
      })
      .catch((error) => {
        console.error('Request failed:', error);
      });
  }

  requestServerInfo(): void {
    this.requestServerInfoByIds(serverStore.servers).catch((error) => {
      console.error('Request failed:', error);
    });
  }

  async requestServerInfoByIds(ids: string[], forceRefresh = false): Promise<void> {
    const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))];
    if (uniqueIds.length === 0) {
      return;
    }

    const idsToFetch: string[] = [];

    for (const id of uniqueIds) {
      if (!forceRefresh) {
        const cached = this.serverInfoCache.get(id) ?? serverStore.getServerInfoById(id);
        if (cached !== undefined) {
          this.serverInfoCache.set(id, cached);
          serverStore.serverIndexById.set(id, cached);
          continue;
        }
      }

      idsToFetch.push(id);
    }

    if (idsToFetch.length === 0) {
      return;
    }

    try {
      const response = await socketService.request('server', 'get_server_info_by_ids', {
        server_ids: idsToFetch,
      });

      const serversInfo = Array.isArray(response.servers_info) ? response.servers_info : [];

      for (const item of serversInfo) {
        const entry = Object.entries(item as Record<string, any>)[0];
        if (!entry) {
          continue;
        }

        const [id, info] = entry;
        this.serverInfoCache.set(id, info);
        serverStore.serverIndexById.set(id, info);

        const channels = info?.channels;
        if (channels !== undefined) {
          this.serverChannelsCache.set(id, channels);
        }
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  }

  async getServerChannels(serverId: string, forceRefresh = false): Promise<any> {
    if (!forceRefresh) {
      const cachedChannels = this.serverChannelsCache.get(serverId) ?? serverStore.getServerChannels(serverId);
      if (cachedChannels !== undefined) {
        this.serverChannelsCache.set(serverId, cachedChannels);
        this.syncServerChannelsToStore(serverId, cachedChannels);
        return cachedChannels;
      }
    }

    const channels = await this.serverChannelsCache.getOrLoad(
      serverId,
      async () => {
        const response = await socketService.request('server', 'get_server_channels', {
          server_id: serverId,
        });

        return response.channels;
      },
      { forceRefresh }
    );

    this.syncServerChannelsToStore(serverId, channels);
    return channels;
  }

  async requestConnectToServerEventChannel(serverId: string): Promise<boolean> {
    return socketService.request('server', 'connect_to_server_event_channel', {
      server_id: serverId,
    });
  }

  requestDisconnectToServerEventChannel(serverId: string): Promise<boolean> {
    return socketService.request('server', 'disconnect_to_server_event_channel', {
      server_id: serverId,
    });
  }

  async getMembersFromVoiceChannels(voiceChannelsIds: string[]): Promise<any> {
    const response = await socketService.request('server', 'get_members_from_voice_channels', {
      channel_ids: voiceChannelsIds,
    });

    return response.channels_member;
  }

  async requestConnectToVoiceChannel(channelId: string): Promise<boolean> {
    return socketService.request('server', 'connect_to_voice_channel', {
      channel_id: channelId,
    });
  }

  requestDisconnectToVoiceChannel(): void {
    socketService.request('server', 'disconnect_to_voice_channel').then();
  }

  async requestInviteUsers(serverId: string, userIds: string[]): Promise<boolean> {
    return socketService.request('server', 'invite_users', {
      server_id: serverId,
      user_ids: userIds,
    });
  }

  invalidateServerCache(serverId: string): void {
    this.serverInfoCache.delete(serverId);
    this.serverChannelsCache.delete(serverId);
  }

  private syncServerChannelsToStore(serverId: string, channels: any): void {
    const serverInfo = serverStore.getServerInfoById(serverId);
    if (serverInfo) {
      serverStore.addServerChannels(serverId, channels);
      return;
    }

    serverStore.serverIndexById.set(serverId, { channels });

    const channelGroups = Object.values((channels as Record<string, any>) ?? {});
    channelGroups.forEach((group) => {
      const groupChannels = Array.isArray(group?.channels) ? group.channels : [];
      groupChannels.forEach((channel: any) => {
        if (channel?.channel_id) {
          serverStore.channelIndexById.set(channel.channel_id, channel);
        }
      });
    });
  }
}

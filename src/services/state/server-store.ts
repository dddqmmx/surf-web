import { reactive } from 'vue';

export class ServerStore {
  servers: string[] = [];
  serverIndexById: Map<string, any> = new Map();
  channelIndexById: Map<string, any> = new Map();
  currentServer = '';

  getServerInfoById(serverId: string) {
    return this.serverIndexById.get(serverId);
  }

  addServerChannels(serverId: string, data: Record<string, any>) {
    const serverInfo = this.getServerInfoById(serverId);
    if (!serverInfo) {
      throw new Error(`Server with ID ${serverId} not found.`);
    }

    serverInfo['channels'] = data;

    Object.values(data)?.forEach((group: any) => {
      group['channels']?.forEach((channel: any) => {
        this.channelIndexById.set(channel['channel_id'], channel);
      });
    });

    return serverInfo['channels'];
  }

  getChannelInfoById(channelId: string) {
    return this.channelIndexById.get(channelId);
  }

  getServerChannels(serverId: string) {
    return this.getServerInfoById(serverId)?.['channels'];
  }
}

export const serverStore = reactive(new ServerStore()) as ServerStore;

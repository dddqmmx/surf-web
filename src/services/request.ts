import CryptoJS from 'crypto-js';
import { v4 as uuidV4 } from 'uuid';
import { socketService } from './socket';
import { authState, devicePreferences, serverStore, userStore } from './state';

export class RequestService {
  sendMessage(sessionId: any, massageInputValue: any) {
    socketService.send('chat', 'send_message', {
      channel_id: sessionId,
      content: massageInputValue,
    });
  }

  async getUserInfo(ids: string[], forceRefresh = false): Promise<Map<string, any>> {
    const now = Date.now();
    const result = new Map<string, any>();
    const idsToFetch: string[] = [];
    const CACHE_EXPIRY = 30 * 60 * 1000;

    const uniqueIds = [...new Set(ids)];

    for (const id of uniqueIds) {
      const userInfo = userStore.userInfoIndexById[id];
      const isValidCache = !forceRefresh && userInfo && now - userInfo.timestamp < CACHE_EXPIRY;

      if (isValidCache) {
        result.set(id, userInfo.data);
      } else {
        idsToFetch.push(id);
      }
    }

    if (idsToFetch.length > 0) {
      try {
        const response = await socketService.request('user', 'search_user', {
          user_id_list: idsToFetch,
        });

        const currentTime = Date.now();
        response.data.forEach((item: any) => {
          userStore.userInfoIndexById[item.user_id] = {
            data: item,
            timestamp: currentTime,
          };
          result.set(item.user_id, item);
        });
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    }

    return result;
  }

  requestUserServers() {
    socketService
      .request('user', 'get_user_servers')
      .then((response) => {
        serverStore.servers = response['servers_id'];
        this.requestServerInfo();
      })
      .catch((error) => {
        console.error('Request failed:', error);
      });
  }

  requestServerInfo() {
    socketService
      .request('server', 'get_server_info_by_ids', {
        server_ids: serverStore.servers,
      })
      .then((response) => {
        response['servers_info'].forEach((info: any) => {
          const [key, value] = Object.entries(info)[0];
          serverStore.serverIndexById.set(key, value);
        });
      })
      .catch((error) => {
        console.error('Request failed:', error);
      });
  }

  async requestServerInfoByIds(ids: any[]) {
    try {
      const response = await socketService.request('server', 'get_server_info_by_ids', {
        server_ids: ids,
      });
      response['servers_info'].forEach((info: any) => {
        const [key, value] = Object.entries(info)[0];
        serverStore.serverIndexById.set(key, value);
      });
    } catch (error) {
      console.error('Request failed:', error);
    }
  }

  async getMessage(channelId: string | null, lastMsg?: any): Promise<any[]> {
    const data: any = { channel_id: channelId };
    if (lastMsg) {
      data['last_msg'] = {
        id: lastMsg['_id']['$oid'],
        time: lastMsg['chat_time']['$date']['$numberLong'],
      };
    }
    const response = await socketService.request('chat', 'get_message', data);
    return response['messages'];
  }

  async getServerChannels(serverId: string) {
    const cachedData = serverStore.getServerChannels(serverId);
    if (cachedData) {
      return cachedData;
    }

    const response = await socketService.request('server', 'get_server_channels', {
      server_id: serverId,
    });

    serverStore.addServerChannels(serverId, response['channels']);
    return response['channels'];
  }

  async requestLogin(account: string | undefined, password: string | undefined): Promise<boolean> {
    try {
      if (!account || !password) {
        throw new Error('Account and password are required');
      }
      const hashed = CryptoJS.MD5(password).toString();
      const response = await socketService.request('user', 'login', {
        account,
        password: hashed,
      });

      if (response['id']) {
        authState.clientUserId = response['id'];
        devicePreferences.initMicStatus();
        devicePreferences.initSpeakerStatus();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login request failed:', error);
      return false;
    }
  }

  async requestRegister(account: string | undefined, password: string | undefined): Promise<boolean> {
    try {
      if (!account || !password) {
        throw new Error('Account and password are required');
      }

      const hashed = CryptoJS.MD5(password).toString();
      const response = await socketService.request('user', 'register', {
        account,
        password: hashed,
      });

      return !!response;
    } catch (error) {
      console.error('Login request failed:', error);
      return false;
    }
  }

  emailCheck(email: string | undefined) {
    socketService
      .request('email', 'email_check', { email })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error('Request failed:', error);
      });
  }

  sendAudio(channelId: string | undefined, data: any) {
    socketService.send('chat', 'send_audio', {
      channel_id: channelId,
      data,
    });
  }

  async requestConnectToServerEventChannel(serverId: string): Promise<boolean> {
    return await socketService.request('server', 'connect_to_server_event_channel', {
      server_id: serverId,
    });
  }

  requestDisconnectToServerEventChannel(serverId: string) {
    return socketService.request('server', 'disconnect_to_server_event_channel', {
      server_id: serverId,
    });
  }

  async getMembersFromVoiceChannels(voiceChannelsIds: string[]) {
    const response = await socketService.request('server', 'get_members_from_voice_channels', {
      channel_ids: voiceChannelsIds,
    });
    return response['channels_member'];
  }

  async requestConnectToVoiceChannel(channel_id: string): Promise<boolean> {
    return await socketService.request('server', 'connect_to_voice_channel', {
      channel_id,
    });
  }

  requestDisconnectToVoiceChannel() {
    socketService.request('server', 'disconnect_to_voice_channel').then();
  }

  async getUserFriends(): Promise<string[]> {
    const response = await socketService.request('user', 'get_user_friends');
    userStore.friends = response['user_ids'];
    return response['user_ids'];
  }

  sendFriendRequest(user_id: string): Promise<boolean> {
    return socketService.request('user', 'send_friend_request', { target_user_id: user_id });
  }

  async getFriendRequests() {
    const response = await socketService.request('user', 'get_friend_requests');
    return response['user_ids'];
  }

  async requestAcceptFriendRequest(userId: string): Promise<boolean> {
    userStore.friends.push(userId);
    return await socketService.request('user', 'accept_friend_request', { target_user_id: userId });
  }

  async requestInviteUsers(serverId: string, userIds: string[]): Promise<boolean> {
    return await socketService.request('server', 'invite_users', { server_id: serverId, user_ids: userIds });
  }

  async sendUserAvatar(
    file: File,
    {
      chunkSize = 32 * 1024,
      concurrency = 4,
    }: { chunkSize?: number; concurrency?: number } = {}
  ) {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const id = uuidV4();

    let index = 0;

    const uploadNext = async () => {
      while (index < totalChunks) {
        const i = index++;
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const buffer = await chunk.arrayBuffer();
        const chunkBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const data: any = {
          id,
          index: i,
          chunk: chunkBase64,
        };
        if (i === 0) {
          data.total = totalChunks;
          data.metadata = {
            filename: file.name,
            mimetype: file.type,
          };
        }
        socketService.send('user', 'upload_user_avatar', data);
      }
    };

    await Promise.all(Array(concurrency).fill(0).map(() => uploadNext()));
  }

  async requestUpdateUserProfile(userProfile: any): Promise<boolean> {
    return await socketService.request('user', 'update_user_profile', userProfile);
  }
}

export const requestService = new RequestService();

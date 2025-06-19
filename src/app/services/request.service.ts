// 在 RequestService 中
import {Injectable} from '@angular/core';
import {SocketService} from './socket.service'; // 假设您的 SocketService 是这个路径
import {CommonDataService} from './common-data.service';
import CryptoJS from 'crypto-js';
import {v4 as uuidV4} from "uuid";

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  constructor(
    private socket: SocketService,
    private commonData: CommonDataService
  ) {
  }

  sendMessage(sessionId: any, massageInputValue: any) {
    this.socket.send("chat", "send_message", {
      "channel_id": sessionId,
      "content": massageInputValue,
    })
  }

  async getUserInfo(ids: string[]): Promise<Map<string, any>> {
    const now = Date.now();
    const result = new Map<string, any>();
    const idsToFetch: string[] = [];
    const CACHE_EXPIRY = 30 * 60 * 1000; // 30分钟，提取为常量

    // 使用 Set 去重并转换为数组
    const uniqueIds = [...new Set(ids)];

    // 分离缓存检查逻辑
    for (const id of uniqueIds) {
      const userInfo = this.commonData.userInfoIndexById[id];
      const isValidCache = userInfo && (now - userInfo.timestamp < CACHE_EXPIRY);

      if (isValidCache) {
        result.set(id, userInfo.data);
      } else {
        idsToFetch.push(id);
      }
    }

    // 批量获取新数据
    if (idsToFetch.length > 0) {
      try {
        const response = await this.socket.request('user', 'search_user', {
          user_id_list: idsToFetch
        });

        const currentTime = Date.now();
        response.data.forEach((item: any) => {
          this.commonData.userInfoIndexById[item.user_id] = {
            data: item,
            timestamp: currentTime
          };
          result.set(item.user_id, item);
        });
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // 根据需求决定是否抛出错误或返回部分结果
      }
    }

    return result;
  }

  public requestUserServers() {
    this.socket.request('user', 'get_user_servers').then(response => {
      console.log('Received response:', response);
      this.commonData.servers = response['servers_id'];
      this.requestServerInfo()
    }).catch(error => {
      console.error('Request failed:', error);
    });
  }

  public requestServerInfo() {
    this.socket.request('server', 'get_server_info_by_ids', {
      "server_ids": this.commonData.servers
    }).then(response => {
      response['servers_info'].forEach((info: any) => {
        const [key, value] = Object.entries(info)[0];
        this.commonData.serverIndexById.set(key, value);
      })
    }).catch(error => {
      console.error('Request failed:', error);
    });
  }

  public async getMessage(channelId: string | null, lastMsg?: any): Promise<any[]>{
    const data: any = {
      "channel_id": channelId,
    };
    if (lastMsg) {
      data["last_msg"] = {
        "id" :lastMsg["_id"]["$oid"],
        "time": lastMsg["chat_time"]["$date"]["$numberLong"]
      };
    }
    const response = await this.socket.request("chat", "get_message", data);
    return response["messages"];
  }


  public async getServerChannels(serverId: string) {
    // 先检查缓存中是否已有数据
    const cachedData = this.commonData.getServerChannels(serverId);
    if (cachedData) {
      return cachedData; // 如果有缓存，直接返回
    }

    // 如果没有缓存，则通过 socket 请求获取数据
    const response = await this.socket.request('server', 'get_server_channels', {
      'server_id': serverId
    });

    // 将数据存入缓存
    this.commonData.addServerChannels(serverId, response['channels']);

    // 返回数据
    return response['channels']; // 返回从 socket 获得的数据
  }

  public async requestLogin(account: string | undefined, password: string | undefined): Promise<boolean> {
    try {
      if (!account || !password) {
        throw new Error('Account and password are required');
      }
      password = CryptoJS.MD5(password).toString()
      console.log("password", password);
      const response = await this.socket.request('user', 'login', {
        account: account,
        password: password
      });

      if (response['id']) {
        this.commonData.clientUserId = response['id'];
        this.commonData.initMicStatus()
        this.commonData.initSpeakerStatus()
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login request failed:', error);
      return false;
    }
  }

  public async requestRegister(account: string | undefined, password: string | undefined): Promise<boolean> {
    try {
      if (!account || !password) {
        throw new Error('Account and password are required');
      }

      password = CryptoJS.MD5(password).toString()
      const response = await this.socket.request('user', 'register', {
        account: account,
        password: password
      });

      return !!response;
    } catch (error) {
      console.error('Login request failed:', error);
      return false;
    }
  }

  public emailCheck(email: string | undefined) {
    this.socket.request('email', 'email_check', {
      'email': email
    }).then(response => {
      console.log(response)
    }).catch(error => {
      console.error('Request failed:', error);
    });
  }

  public sendAudio(channelId: string | undefined, data: any) {
    this.socket.send("chat", "send_audio", {
      "channel_id": channelId,
      "data": data
    })
  }

  public async requestConnectToServerEventChannel(serverId: string): Promise<boolean> {
    return await this.socket.request("server", "connect_to_server_event_channel", {
      "server_id": serverId
    })
  }

  public requestDisconnectToServerEventChannel(serverId: string) {
    return this.socket.request("server", "disconnect_to_server_event_channel", {
      "server_id": serverId
    })
  }

  public async getMembersFromVoiceChannels(voiceChannelsId: string[]) {
    const response = await this.socket.request("server", "get_members_from_voice_channels", {
      "channels_id": voiceChannelsId
    });
    return response['channels_member'];
  }

  public async requestConnectToVoiceChannel(channel_id: string): Promise<boolean> {
    return await this.socket.request("server", "connect_to_voice_channel", {
      "channel_id": channel_id
    });
  }

  public requestDisconnectToVoiceChannel(channel_id: string | undefined) {
    this.socket.request("server", "disconnect_to_voice_channel",{
      "channel_id":channel_id
    })
  }

  public getUserAvatars(ids: string[]): any {
    this.socket.send("user", "get_user_avatars", {"user_ids": ids})
  }

  public async getUserFriends(): Promise<string[]>{
    const response =  await this.socket.request("user", "get_user_friends")
    this.commonData.friends = response['user_ids'];
    return response['user_ids'];
  }

  public sendFriendRequest(user_id: string): Promise<boolean>{
    return  this.socket.request("user", "send_friend_request", {"user_id": user_id})
  }

  public async getFriendRequests(){
    const response =  await this.socket.request("user", "get_friend_requests")
    return response['user_ids'];
  }

  public async requestAcceptFriendRequest(userId: string):Promise<boolean>{
    this.commonData.friends.push(userId)
    return await this.socket.request("user", "accept_friend_request", {"user_id": userId});
  }

  public async requestInviteUsers(serverId: string,userIds: string[]):Promise<boolean>{
    return await this.socket.request("server", "invite_users", {"server_id": serverId, "user_ids": userIds});
  }

  public async sendUserAvatar(file: File, {
    chunkSize = 32 * 1024,  // 默认 256KB，比 64KB 高效
    concurrency = 4          // 默认 4 并发，自测网络可调整
  } = {}) {
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
        let data:any = {
          id,
          index: i,
          chunk: chunkBase64,
        }
        if (i == 0){
          data.total = totalChunks
          data.metadata = {
            filename: file.name,
            mimetype: file.type
          }
        }
        this.socket.send("user", "upload_user_avatar",data);
      }
    };

    await Promise.all(Array(concurrency).fill(0).map(() => uploadNext()));
  }
}

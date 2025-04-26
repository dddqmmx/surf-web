import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {

  constructor() {}

  uiState= {
    isMobile:false,
    persistent: true,
    secondary: true,
    primary: true
  }

  clientUserId: string = "";
  servers: any[] = []
  friends: any[] = []
  // key:id,content:serverInfo
  serverIndexById: Map<string, any> = new Map()
  // key: channelId, content: channelInfo
  channelIndexById: Map<string, any> = new Map();
  // key: userInfoId, content: userInfo
  userInfoIndexById: { [key: string]: any } = {};
  currentServer:string ="";
  voiceChatting: boolean = false;
  voiceChannel: string= "";
  micEnabled: boolean = false;
  speakerEnabled: boolean = true;

  private micEnabledKey = `micEnabled-${this.clientUserId}`;
  private speakerEnabledKey = `speakerEnabled-${this.clientUserId}`;

  initMicStatus() {
    this.micEnabled = JSON.parse(localStorage.getItem(this.micEnabledKey) || 'false');
  }

  // 获取扬声器当前状态
  initSpeakerStatus() {
    this.speakerEnabled = JSON.parse(localStorage.getItem(this.speakerEnabledKey) || 'false');
  }

  // 切换麦克风状态
  toggleMic(): void {
    this.micEnabled = !this.micEnabled;
    localStorage.setItem(this.micEnabledKey, String(this.micEnabled));
  }

  // 切换扬声器状态
  toggleSpeaker(): void {
    this.speakerEnabled = !this.speakerEnabled;
    localStorage.setItem(this.speakerEnabledKey, String(this.speakerEnabled));
  }

  hasUserInfo(id: string) {
    return this.userInfoIndexById.hasOwnProperty(id);
  }

  getUserInfo(id: string) {
    return this.userInfoIndexById[id]?.data;
  }

  public getServerInfoById(serverId: string) {
    return this.serverIndexById.get(serverId);
  }

  public addServerChannels(serverId: string, data: Record<string, any>) {
    console.log(serverId, data)
    const serverInfo = this.getServerInfoById(serverId);
    if (!serverInfo) {
      throw new Error(`Server with ID ${serverId} not found.`);
    }

    // 设置 channels 并处理 channel 信息
    serverInfo['channels'] = data;

    Object.values(data)?.forEach((group: any) => {
      group['channels']?.forEach((channel: any) => {
        this.channelIndexById.set(channel["channel_id"], channel);
      });
    });


    return serverInfo['channels'];
  }


  public getChannelInfoById(channelId: string) {
    return this.channelIndexById.get(channelId);
  }


  public getServerChannels(serverId: string) {
    return this.getServerInfoById(serverId)['channels']
  }


}

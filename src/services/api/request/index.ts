import { ChatRequestApi } from './chat-api';
import { ServerRequestApi } from './server-api';
import { UserRequestApi } from './user-api';

export class RequestService {
  private readonly chatApi = new ChatRequestApi();
  private readonly serverApi = new ServerRequestApi();
  private readonly userApi = new UserRequestApi();

  sendMessage(sessionId: string | null | undefined, messageContent: string): void {
    this.chatApi.sendMessage(sessionId, messageContent);
  }

  getUserInfo(ids: string[], forceRefresh = false): Promise<Map<string, any>> {
    return this.userApi.getUserInfo(ids, forceRefresh);
  }

  requestUserServers(): void {
    this.serverApi.requestUserServers();
  }

  requestServerInfo(): void {
    this.serverApi.requestServerInfo();
  }

  requestServerInfoByIds(ids: string[], forceRefresh = false): Promise<void> {
    return this.serverApi.requestServerInfoByIds(ids, forceRefresh);
  }

  getMessage(channelId: string | null, lastMsg?: any): Promise<any[]> {
    return this.chatApi.getMessage(channelId, lastMsg);
  }

  getServerChannels(serverId: string, forceRefresh = false): Promise<any> {
    return this.serverApi.getServerChannels(serverId, forceRefresh);
  }

  requestLogin(account: string | undefined, password: string | undefined): Promise<boolean> {
    return this.userApi.requestLogin(account, password);
  }

  requestRegister(account: string | undefined, password: string | undefined): Promise<boolean> {
    return this.userApi.requestRegister(account, password);
  }

  emailCheck(email: string | undefined): void {
    this.userApi.emailCheck(email);
  }

  sendAudio(channelId: string | undefined, data: unknown): void {
    this.chatApi.sendAudio(channelId, data);
  }

  requestConnectToServerEventChannel(serverId: string): Promise<boolean> {
    return this.serverApi.requestConnectToServerEventChannel(serverId);
  }

  requestDisconnectToServerEventChannel(serverId: string): Promise<boolean> {
    return this.serverApi.requestDisconnectToServerEventChannel(serverId);
  }

  getMembersFromVoiceChannels(voiceChannelsIds: string[]): Promise<any> {
    return this.serverApi.getMembersFromVoiceChannels(voiceChannelsIds);
  }

  requestConnectToVoiceChannel(channelId: string): Promise<boolean> {
    return this.serverApi.requestConnectToVoiceChannel(channelId);
  }

  requestDisconnectToVoiceChannel(): void {
    this.serverApi.requestDisconnectToVoiceChannel();
  }

  getUserFriends(): Promise<string[]> {
    return this.userApi.getUserFriends();
  }

  sendFriendRequest(userId: string): Promise<boolean> {
    return this.userApi.sendFriendRequest(userId);
  }

  getFriendRequests(): Promise<string[]> {
    return this.userApi.getFriendRequests();
  }

  requestAcceptFriendRequest(userId: string): Promise<boolean> {
    return this.userApi.requestAcceptFriendRequest(userId);
  }

  requestInviteUsers(serverId: string, userIds: string[]): Promise<boolean> {
    return this.serverApi.requestInviteUsers(serverId, userIds);
  }

  sendUserAvatar(
    file: File,
    options: { chunkSize?: number; concurrency?: number } = {}
  ): Promise<void> {
    return this.userApi.sendUserAvatar(file, options);
  }

  requestUpdateUserProfile(userProfile: Record<string, unknown>): Promise<boolean> {
    return this.userApi.requestUpdateUserProfile(userProfile);
  }
}

export const requestService = new RequestService();

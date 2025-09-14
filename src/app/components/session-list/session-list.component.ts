import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {RequestService} from "../../services/request.service";
import {Router} from "@angular/router";
import {VoiceChatService} from "../../services/voice-chat.service";
import {CommonDataService} from "../../services/common-data.service";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs";
import {FileService, FileType} from "../../services/file.service";
import {InviteDialogComponent} from "../invite-dialog/invite-dialog.component";
import {AvatarComponent} from "../avatar/avatar.component";
import {ServerSettingDialogComponent} from "../server-setting-dialog/server-setting-dialog.component";

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgOptimizedImage,
    InviteDialogComponent,
    AvatarComponent,
    ServerSettingDialogComponent
  ],
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.css'
})
export class SessionListComponent implements OnInit, OnDestroy {
  @Output() sessionSelected = new EventEmitter<{ sessionId: string | null, sessionType: string | null }>();
  serverInfo: any = null;
  protected serverId: string = "";
  protected membersFromChannels: any = {};  // 确保它是一个对象

  subscriptions: Subscription[] = [];

  constructor(protected file: FileService, private socket: SocketService, protected commonDataService: CommonDataService, private requestService: RequestService, private router: Router, private voiceChatService: VoiceChatService) {
  }

  ngOnInit(): void {
    const serverEventSubject = this.socket.getMessageSubject("server", "server_event").subscribe(
      message => {
        if (message["type"] === "user_join_voice_channel") {
          const channelId = message["channel_id"];
          const userId = message["user_id"];
          const clientId = message["client_id"];
          // 如果该频道已存在成员列表，则添加；否则新建一个数组
          if (this.membersFromChannels[channelId]) {
            // 避免重复添加
            const exists = this.membersFromChannels[channelId].some(
              (m: { user_id: string; client_id: string }) =>
                m.user_id === userId && m.client_id === clientId
            );
            if (!exists) {
              this.membersFromChannels[channelId].push({ user_id: userId, client_id: clientId });
            }
          } else {
            this.membersFromChannels[channelId] = [{"user_id":userId, "client_id":clientId}];
          }
          this.requestService.getUserInfo([userId]).then();
        }
        if (message["type"] === "user_leave_voice_channel") {
          const channelId = message["channel_id"];
          const userId = message["user_id"];
          this.voiceChatService.leave(userId)
          if (this.membersFromChannels[channelId]) {
            this.membersFromChannels[channelId] = this.membersFromChannels[channelId].filter(
              (m: { user_id: string; client_id: string }) =>
                !(m.user_id === userId)
            );
            if (this.membersFromChannels[channelId].length === 0) {
              delete this.membersFromChannels[channelId];
            }
          }
        }
      })
    this.subscriptions.push(serverEventSubject);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public async getServerChannels(serverId: string) {
    this.serverId = serverId;
    this.commonDataService.currentServer = serverId;
    let channelsData = await this.requestService.getServerChannels(serverId)
    const voiceChannelIds = channelsData.flatMap((group: { channels: any[]; }) =>
      group.channels.filter(channel => channel.channel_type === "voice").map(channel => channel.channel_id)
    );
    this.requestService.requestConnectToServerEventChannel(serverId).then(r => {
      this.requestService.getMembersFromVoiceChannels(voiceChannelIds).then(r => {
        console.log(r)
        for (const [channelId, members] of Object.entries(r)) {
          // 确保 members 是一个数组
          if (Array.isArray(members)) {
            this.requestService.getUserInfo(
              members.map((member: { user_id: string; client_id: string }) => member.user_id)
            );
          } else {
            console.warn(`Invalid members data in channel ${channelId}:`, members);
          }
        }
        this.membersFromChannels = r;
      })
    })
    this.serverInfo = this.commonDataService.getServerInfoById(serverId)
    if (this.serverInfo) {
    }
  }

  backToSessionList() {
    this.requestService.requestDisconnectToServerEventChannel(this.serverId).then();
    this.serverInfo = undefined;
    this.commonDataService.currentServer = "";
    this.router.navigate(['/main/session']).then();
    this.isMenuOpen = false;
  }

  async toChat(channelId: any, channelType: any) {
    if (channelType == 'text') {
      this.router.navigate(['/main/session/chat'], {queryParams: {"channel_id": channelId}}).then();
      if (this.commonDataService.uiState.isMobile){
        this.commonDataService.uiState.persistent = false;
        this.commonDataService.uiState.secondary = false;
        this.commonDataService.uiState.primary = true;
      }else {
        this.commonDataService.uiState.primary = true;
      }
    } else if (channelType == 'voice') {
      const connected = await this.requestService.requestConnectToVoiceChannel(channelId);
      if (connected) {
        const members = this.membersFromChannels[channelId];
        console.log(members); // 当前频道的所有用户
        this.voiceChatService.initializeRecorder(channelId).then(() => {
          this.commonDataService.voiceChatting = true;
          this.commonDataService.voiceChannel = channelId;
          for (const member of members) {
            if (member.user_id == this.commonDataService.clientUserId){
              continue;
            }
            this.voiceChatService.join(member.user_id,member.client_id)
          }
        });
      }
    }
  }

  // 组件中添加
  isMenuOpen = false;

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleMenuClick(action: string) {
    this.isMenuOpen = false;
    if (action == "invite"){
      this.toggleInviteDialog()
      return
    }
    if (action == "settings"){
      this.toggleServerSettingDialog()
      return;
    }
    // 处理不同菜单操作
    console.log('Selected action:', action);
  }

  inviteDialog = false
  serverSettingDialog = false
  toggleInviteDialog() {
    this.inviteDialog = !this.inviteDialog;
  }
  toggleServerSettingDialog() {
    this.serverSettingDialog = !this.serverSettingDialog;
  }


  protected readonly FileType = FileType;
}

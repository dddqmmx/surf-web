import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgOptimizedImage, NgStyle} from "@angular/common";
import {Subscription} from "rxjs";
import {SocketService} from "../../services/socket.service";
import {CommonDataService} from "../../services/common-data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {RequestService} from "../../services/request.service";
import {SessionListComponent} from "../../components/session-list/session-list.component";
import {FormsModule} from "@angular/forms";
import {FileService, FileType} from "../../services/file.service";
import { Location } from '@angular/common';
import {AvatarComponent} from "../../components/avatar/avatar.component";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    SessionListComponent,
    NgIf,
    FormsModule,
    NgClass,
    NgStyle,
    AvatarComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('chatContent') chatContent!: ElementRef;

  subscriptions: Subscription[] = [];

  sessionName = '';
  messageList: any[] = [];
  sessionId: string | null = null;
  sessionType: string | null = null;
  scrollToBottomFlag: boolean = false;
  messageInputValue = "";

  constructor(
    protected file: FileService,
    private requestService: RequestService,
    private socketService: SocketService,
    protected commonData: CommonDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  async ngOnInit() {
    const newMassageSubject = this.socketService.getMessageSubject("chat", "new_message").subscribe(
      message => {
        this.requestService.getUserInfo([message['user_id']]).then()
        this.messageList.push(message)
        this.scrollToBottomFlag = true;
      })
    this.subscriptions.push(newMassageSubject);
    const channelId = this.activatedRoute.snapshot.queryParamMap.get('channel_id');
    if (channelId) {
      this.sessionId = channelId;
      this.messageList = await this.requestService.getMessage(channelId);
      const userIds = Array.from(new Set(this.messageList.map((message: any) => message.user_id)));
      await this.requestService.getUserInfo(userIds);
      await this.requestService.getUserAvatars(userIds)
      this.scrollToBottomFlag = true;
      this.sessionName = this.commonData.getChannelInfoById(channelId)["channel_name"]
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async selectImage() {
    try {
      // 弹出文件选择器
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Images',
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg', '.gif']
            }
          }
        ],
        multiple: false // 仅允许单个文件
      });

      // 获取文件内容
      const file = await fileHandle.getFile();
      const reader = new FileReader();

      reader.onload = () => {
        this.messageList.push({
          "user_id": this.commonData.clientUserId,
          "type": "img",
          "content": "file_id"
        })
        this.scrollToBottomFlag = true;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('文件选择已取消', error);
    }
  }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollTop === 0) {
      const previousHeight = element.scrollHeight;
      this.getMessageFromHistory()
      const newHeight = element.scrollHeight;
      element.scrollTop = newHeight - previousHeight;
    }
  }

  getMessageFromHistory() {
    if (this.sessionId) {
      this.requestService.getMessage(this.sessionId, this.messageList[0]).then(r => {
        this.messageList = r.concat(this.messageList);
      })
    }
  }

  sendMessage() {
    const trimmedMessage = this.messageInputValue.trim(); // 去掉前后空格和换行
    if (trimmedMessage !== "") {
      this.requestService.sendMessage(this.sessionId, trimmedMessage);
      this.messageInputValue = "";
      this.scrollToBottomFlag = true;
    }
  }

  scrollToBottom(): void {
    if (this.chatContent) {
      const element = this.chatContent.nativeElement;
      element.scrollTop = element.scrollHeight; // 滚动到底部
    }
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottomFlag) {
      this.scrollToBottom(); // 每次视图更新后滚动到底部
      this.scrollToBottomFlag = false;
    }
  }

  back(){
    this.commonData.uiState.persistent = true;
    this.commonData.uiState.secondary = true
    this.commonData.uiState.primary = false
  }

  protected readonly FileType = FileType;
}

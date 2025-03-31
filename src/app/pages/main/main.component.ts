import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";
import {SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs";
import {VoiceChatService} from "../../services/voice-chat.service";
import {RequestService} from "../../services/request.service";
import {ChatComponent} from "../chat/chat.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterOutlet,
    NgOptimizedImage,
    NgForOf,
    NgIf,
    ChatComponent,
    NgClass
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  constructor(
    protected request: RequestService,
    private router: Router,
    private socketService: SocketService,
    protected commonData: CommonDataService,
    private voiceChatService: VoiceChatService) {
  }

  options = [
    {name: 'chat', icon: '/images/icon/chat_bubble.svg', height: 38, width: 38},
    // {name: 'groups', icon: '/images/icon/groups.svg', height: 38, width: 38},
    {name: 'channels', icon: '/images/icon/campaign.svg', height: 38, width: 38},
    {name: 'person', icon: '/images/icon/person.svg', height: 38, width: 38},
    {name: 'call', icon: '/images/icon/call.svg', height: 38, width: 38},
    {name: 'settings', icon: '/images/icon/settings.svg', height: 38, width: 38},
  ];

  selectedOption: string = 'chat';  // 记录当前选中的选项.

  // 处理选择操作，更新 selectedOption
  onSelect(option: any) {
    this.selectedOption = option.name;
    switch (option.name) {
      case 'channels':{
        this.router.navigate(['/main/channels']).then();
        break
      }
      case 'userInfo': {
        this.router.navigate(['/main/user-info']).then();
        break
      }
      case 'chat': {
        this.router.navigate(['/main/session']).then();
        break
      }
      case 'settings': {
        this.router.navigate(['/main/settings']).then();
        break
      }
      case 'person': {
        this.router.navigate(['/main/contacts']).then();
      }
    }
  }

  ngOnInit(): void {
    this.request.getUserInfo([this.commonData.clientUserId]).then(() => {
      const avatar = this.commonData.getUserInfo(this.commonData.clientUserId)['avatar']
      this.request.getUserAvatars([avatar])
    })
  }


}

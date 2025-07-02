import {Component, OnInit} from '@angular/core';
import {SessionListComponent} from "../../../components/session-list/session-list.component";
import {NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {RequestService} from "../../../services/request.service";
import {NgClass, NgIf, NgStyle} from "@angular/common";
import {CommonDataService} from "../../../services/common-data.service";
import {VoiceChatService} from "../../../services/voice-chat.service";
import {InviteDialogComponent} from "../../../components/invite-dialog/invite-dialog/invite-dialog.component";
import {filter} from "rxjs";

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    SessionListComponent,
    RouterOutlet,
    NgIf,
    NgClass,
    InviteDialogComponent,
    NgStyle
  ],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css'
})
export class SessionComponent implements OnInit {
  constructor(protected router: Router,protected requestService: RequestService, protected commonData: CommonDataService, protected voiceChatService: VoiceChatService) {
  }

  ngOnInit(): void {
    this.requestService.requestUserServers()
    if (this.commonData.uiState.isMobile) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.commonData.uiState.secondary = !this.router.url.includes('/main/session/chat');
        this.commonData.uiState.primary = true
      });
    }
  }

  stopVoiceChat(): void {
    this.voiceChatService.leave()
    this.commonData.voiceChatting = false;
    this.commonData.voiceChannel = "";
  }
}

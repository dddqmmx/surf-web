import {Component, OnInit} from '@angular/core';
import {SessionListComponent} from "../../../components/session-list/session-list.component";
import {NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {RequestService} from "../../../services/request.service";
import {NgClass, NgIf} from "@angular/common";
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
        InviteDialogComponent
    ],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css'
})
export class SessionComponent implements OnInit {
  constructor(protected router: Router,protected requestService: RequestService, protected commonDataService: CommonDataService, protected voiceChatService: VoiceChatService) {

  }
  //手机端适配
  showSessionList = true;

  ngOnInit(): void {
    this.requestService.requestUserServers()
    if (window.matchMedia('(max-aspect-ratio: 1/1)').matches) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.showSessionList = !this.router.url.includes('/main/session/chat');
        console.log(this.showSessionList);
      });
    }
  }

  stopVoiceChat(): void {
    this.voiceChatService.stopRecording()
    this.commonDataService.voiceChatting = false;
    this.commonDataService.voiceChannel = "";
  }
}

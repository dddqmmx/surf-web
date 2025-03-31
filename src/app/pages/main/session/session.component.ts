import {Component, OnInit} from '@angular/core';
import {SessionListComponent} from "../../../components/session-list/session-list.component";
import {RouterOutlet} from "@angular/router";
import {RequestService} from "../../../services/request.service";
import {NgClass, NgIf} from "@angular/common";
import {CommonDataService} from "../../../services/common-data.service";
import {VoiceChatService} from "../../../services/voice-chat.service";

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    SessionListComponent,
    RouterOutlet,
    NgIf,
    NgClass
  ],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css'
})
export class SessionComponent implements OnInit {
  constructor(protected requestService: RequestService, protected commonDataService: CommonDataService, protected voiceChatService: VoiceChatService) {

  }

  ngOnInit(): void {
    this.requestService.requestUserServers()
  }

  stopVoiceChat(): void {
    this.voiceChatService.stopRecording()
    this.commonDataService.voiceChatting = false;
    this.commonDataService.voiceChannel = "";
  }
}

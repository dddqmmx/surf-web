import {Component, Input} from '@angular/core';
import {FileService, FileType} from "../../services/file.service";
import {RequestService} from "../../services/request.service";
import {Router} from "@angular/router";
import {SocketService} from "../../services/socket.service";
import {CommonDataService} from "../../services/common-data.service";
import {VoiceChatService} from "../../services/voice-chat.service";

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css'
})
export class AvatarComponent {
  constructor(
    protected file: FileService,
    protected request: RequestService,
    private router: Router,
    private socketService: SocketService,
    protected commonData: CommonDataService,
    private voiceChatService: VoiceChatService) {
  }
  @Input() userId!: string; // 通过输入用户ID

  protected readonly FileType = FileType;
}

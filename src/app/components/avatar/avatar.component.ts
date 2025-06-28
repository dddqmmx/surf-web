import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FileService, FileType} from "../../services/file.service";
import {RequestService} from "../../services/request.service";
import {Event, Router} from "@angular/router";
import {SocketService} from "../../services/socket.service";
import {CommonDataService} from "../../services/common-data.service";
import {VoiceChatService} from "../../services/voice-chat.service";
import {AvatarService} from "../../services/ui/avatar.service";
import {filter} from "rxjs";

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css'
})
export class AvatarComponent implements OnChanges,OnInit {
  constructor(
    protected file: FileService,
    protected request: RequestService,
    private router: Router,
    private socketService: SocketService,
    protected commonData: CommonDataService,
    private avatarService: AvatarService,
    private voiceChatService: VoiceChatService) {
    this.updateAvatar()
  }
  @Input() userId!: string; // 通过输入用户ID
  avatarUrl:string = '';

  protected readonly FileType = FileType;

  ngOnInit(): void {
    this.avatarService.avatarChanged$
      .pipe(filter((id: string) => id === this.userId)) // 只处理自己
      .subscribe(() => this.updateAvatar());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && this.userId) {
      this.updateAvatar();
    }
  }

  public updateAvatar(): void {
    this.avatarUrl = `${this.commonData.httpPrefix}/user/avatar/${this.userId}?t=${Date.now()}`;
  }

  onAvatarError(event: any) {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('default-avatar.png')) {
      img.src = '/images/avatar/default-avatar.png';
    }
  }


}

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
    protected request: RequestService,
    protected commonData: CommonDataService,
    private avatarService: AvatarService,) {
    this.updateAvatar()
  }
  @Input() id!: string; // 用户ID或服务器ID
  @Input() type: 'user' | 'server' = 'user'; // 类型，默认用户头像
  avatarUrl:string = '';

  protected readonly FileType = FileType;

  ngOnInit(): void {
    this.avatarService.avatarChanged$
      .pipe(filter((changedId: string) => changedId === this.id))
      .subscribe(() => this.updateAvatar());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.updateAvatar();
    }
  }

  updateAvatar(): void {
    if (this.type === 'user') {
      this.avatarUrl = `${this.commonData.httpPrefix}/user/avatar/${this.id}?t=${Date.now()}`;
    } else if (this.type === 'server') {
      this.avatarUrl = `${this.commonData.httpPrefix}/server/icon/${this.id}?t=${Date.now()}`;
    }
  }

  onAvatarError(event: any) {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('default-avatar.png')) {
      img.src = '/images/avatar/default-avatar.png';
    }
  }


}

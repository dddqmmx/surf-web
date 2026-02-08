import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {SocketService} from "./services/socket.service";
import {NgIf} from "@angular/common";
import {RequestService} from "./services/request.service";
import {CommonDataService} from "./services/common-data.service";
import {DevConsoleComponent} from "./components/dev-console/dev-console.component";
import {VoiceChatService} from "./services/voice-chat.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterOutlet, NgIf, DevConsoleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  loadingFlag: boolean = true;
  remoteAudios: Map<string, HTMLAudioElement> = new Map();
  constructor(
    private router: Router,
    protected socket: SocketService,
    private requestService: RequestService,
    public voiceChatService: VoiceChatService,
    private commonData: CommonDataService
  ) { }

  private setupMobileDetection() {
    const mediaQuery = window.matchMedia('(max-aspect-ratio: 1/1)');

    const updateIsMobile = () => {
      this.commonData.uiState.isMobile = mediaQuery.matches;
    };

    // 初始判断一次
    updateIsMobile();

    // 监听变化
    mediaQuery.addEventListener('change', updateIsMobile);
  }

  ngOnInit(): void {
    // 移动端检测
    this.setupMobileDetection();
    this.commonData.host = window.location.hostname;
    this.commonData.sslEnabled = window.location.protocol === 'https:';
    // 加载程序
    this.socket.initializeMainConnection( this.commonData.websocketUrl).then(() => {
      this.loadingFlag = false;
    });
  }

  ngAfterViewInit(): void {
    this.voiceChatService.onRemoteStream.subscribe(({ userId, stream }) => {
      let audio = this.remoteAudios.get(userId);
      if (!audio) {
        audio = document.createElement('audio');
        audio.autoplay = true;
        this.remoteAudios.set(userId, audio);
        document.body.appendChild(audio);
      }
      audio.srcObject = stream;
    });

    this.voiceChatService.onRemoteLeave.subscribe(({userId}) => {
      const audio = this.remoteAudios.get(userId);
      if (audio) {
        audio.pause();
        audio.srcObject = null;
        audio.remove();
        this.remoteAudios.delete(userId);
      }
    });
  }
}

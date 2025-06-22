import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {SocketService} from "./services/socket.service";
import {NgIf} from "@angular/common";
import {RequestService} from "./services/request.service";
import {CommonDataService} from "./services/common-data.service";
import {filter} from "rxjs";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  loadingFlag: boolean = true;

  constructor(
    private router: Router,
    protected socket: SocketService,
    private requestService: RequestService,
    private commonData: CommonDataService
  ) { }

  private setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

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
    // 设置视口高度
    this.setViewportHeight();
    window.addEventListener('resize', this.setViewportHeight);
    window.addEventListener('orientationchange', this.setViewportHeight);

    // 移动端检测
    this.setupMobileDetection();

    // 加载程序
    this.socket.initializeMainConnection("ws://" + window.location.hostname + ':8080/ws').then(() => {
      this.loadingFlag = false;

      const storedUsername = localStorage.getItem('username') || '';
      const storedPassword = localStorage.getItem('password') || '';
      const storedRememberMe = localStorage.getItem('rememberMe') || '';

      if (storedRememberMe === 'true') {
        this.requestService.requestLogin(storedUsername, storedPassword).then(r => {
          if (r) {
            this.router.navigate(['/main/session']).then();
          }
        });
      } else {
        this.router.navigate(["login"]).then();
      }
    });
  }
}

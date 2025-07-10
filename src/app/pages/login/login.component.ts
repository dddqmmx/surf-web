import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForOf, NgOptimizedImage} from "@angular/common";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {SocketService} from "../../services/socket.service";
import {connect, Subscription} from "rxjs";
import {CommonDataService} from "../../services/common-data.service";
import {RequestService} from "../../services/request.service";
import {UserService} from "../../services/api/user.service";
import {CreateServerDialogComponent} from "../../components/create-server-dialog/create-server-dialog.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    FormsModule,
    CreateServerDialogComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    private requestService: RequestService,
    protected router: Router,
    private socket: SocketService,
    private userService:UserService,
    private commonData: CommonDataService) {
  }

  subscriptions: Subscription[] = [];
  account: string | undefined;
  password: string | undefined;
  rememberMe: boolean = false;

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  ngOnInit(): void {
  }

  login() {
    if (this.rememberMe) {
      // 如果记住我勾选，则再次更新存储
      localStorage.setItem('rememberMe', "true");
      if (typeof this.account === "string") {
        localStorage.setItem('username', this.account);
      }
      if (typeof this.password === "string") {
        localStorage.setItem('password', this.password);
      }
    }
    const success = this.userService.login(this.account, this.password)
    success.subscribe(value => {
      if (value) {
        this.router.navigate(['/main/session']).then();
      }else{
        alert("登录失败，账号或密码错误")
      }
    })
  }

  toManageUsers() {
    this.router.navigate(['/manage-users']).then();
  }
}

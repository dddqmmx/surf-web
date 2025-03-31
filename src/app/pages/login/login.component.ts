import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForOf, NgOptimizedImage} from "@angular/common";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {SocketService} from "../../services/socket.service";
import {connect, Subscription} from "rxjs";
import {CommonDataService} from "../../services/common-data.service";
import {RequestService} from "../../services/request.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    private requestService: RequestService,
    protected router: Router,
    private socket: SocketService,
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
    this.requestService.requestLogin(this.account, this.password).then(
      response => {
        if (response){
          this.router.navigate(['/main/session']).then();
        }
      }
    )
  }

  toManageUsers() {
    this.router.navigate(['/manage-users']).then();
  }
}

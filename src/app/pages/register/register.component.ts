import {Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {RequestService} from "../../services/request.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(protected request: RequestService, protected router: Router) {
  }

  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  register() {
    if (!this.username || !this.password || !this.confirmPassword) {
      alert('请填写所有字段');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    this.request.requestRegister(this.username, this.password).then(response => {
      if (response) {
        alert("注册成功")
        this.request.requestLogin(this.username, this.password).then(
          response => {
            if (response) {
              this.router.navigate(['/main/session']).then();
            }
          }
        )
      } else {
        alert("注册失败，未知原因")
      }
    });
  }
}

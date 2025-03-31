import { Component } from '@angular/core';
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
  constructor(protected request:RequestService,protected router:Router) {
  }
  email: string | undefined
  requestEmailCode(email: string | undefined){
    this.request.emailCheck(email)
  }
  register(){

  }
}

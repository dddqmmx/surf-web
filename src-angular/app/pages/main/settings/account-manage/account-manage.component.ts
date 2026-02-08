import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonDataService} from "../../../../services/common-data.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-account-manage',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './account-manage.component.html',
  styleUrl: './account-manage.component.css'
})
export class AccountManageComponent implements OnInit {
  rememberMe = false;

  constructor(protected commonDataService:CommonDataService,protected router:Router) {
  }

  ngOnInit(): void {
    const storedRememberMe = localStorage.getItem('rememberMe') || '';

    if (storedRememberMe === 'true') {
      this.rememberMe = true;
    }
  }

  onRememberMeChange(newValue: boolean): void {
    localStorage.setItem('rememberMe', newValue.toString());
  }

  logout(){
    localStorage.setItem('rememberMe', "false");
    this.commonDataService.clientUserId = "";
    this.router.navigate(['/login']).then();
  }


}

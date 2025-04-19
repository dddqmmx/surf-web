import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {RequestService} from "../../../../services/request.service";
import {NgForOf} from "@angular/common";
import {CommonDataService} from "../../../../services/common-data.service";

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './search-user.component.html',
  styleUrl: './search-user.component.css'
})
export class SearchUserComponent {
  constructor(protected request: RequestService,protected commonData:CommonDataService) {
  }
  user_id:string = "900cf506-1255-40c6-b6ae-862f0da330a7"
  result:any
  userList: string[] = [];

  searchUser(){
    this.request.getUserInfo([this.user_id]).then(response => {
      this.result = response
      this.userList = Array.from(response.keys())
    })
  }
}

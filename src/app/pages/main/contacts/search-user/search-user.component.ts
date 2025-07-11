import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {RequestService} from "../../../../services/request.service";
import {NgForOf} from "@angular/common";
import {CommonDataService} from "../../../../services/common-data.service";
import {AvatarComponent} from "../../../../components/avatar/avatar.component";

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    AvatarComponent
  ],
  templateUrl: './search-user.component.html',
  styleUrl: './search-user.component.css'
})
export class SearchUserComponent {
  constructor(protected request: RequestService,protected commonData:CommonDataService) {
  }
  userId:string = ""
  result:any
  userList: string[] = [];

  searchUser(){
    this.request.getUserInfo([this.userId]).then(response => {
      this.result = response
      this.userList = Array.from(response.keys())
    })

  }
  sendFriendRequest(userId:string){
    this.request.sendFriendRequest(userId).then(
      response => {
        if (response){
          alert("添加成功")
        }else {
          alert("你无法发送好友请求")
        }
      }
    )
  }



}

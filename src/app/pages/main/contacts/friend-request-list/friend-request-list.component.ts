import {Component, OnInit} from '@angular/core';
import {RequestService} from "../../../../services/request.service";
import {NgForOf, NgIf} from "@angular/common";
import {CommonDataService} from "../../../../services/common-data.service";

@Component({
  selector: 'app-friend-request-list',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './friend-request-list.component.html',
  styleUrl: './friend-request-list.component.css'
})
export class FriendRequestListComponent implements OnInit {
  constructor(protected request: RequestService,protected commonData: CommonDataService) {
  }

  friendRequests = []

  ngOnInit(): void {
    this.request.getFriendRequests().then(user_ids => {
        this.friendRequests = user_ids
        this.request.getUserInfo(user_ids).then()
      }
    )
  }

  acceptFriendRequest(userId: string){
    this.request.requestAcceptFriendRequest(userId).then(response=>{
      if (response){
        this.friendRequests = this.friendRequests.filter(item => item !== userId);
        alert("成功同意好友请求")
      }else {
        alert("出错")
      }
    })
  }
}

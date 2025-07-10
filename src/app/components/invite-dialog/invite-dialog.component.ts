import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgForOf, NgOptimizedImage} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";
import {RequestService} from "../../services/request.service";

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage
  ],
  templateUrl: './invite-dialog.component.html',
  styleUrl: './invite-dialog.component.css'
})
export class InviteDialogComponent implements OnInit{
  constructor(protected commonData:CommonDataService,protected request:RequestService) {
  }

  @Input() serverId!: string; // 通过输入属性接收服务器 ID

  ngOnInit() {
    console.log('当前服务器 ID：', this.serverId);
    this.request.getUserFriends().then(user_ids => {
        this.request.getUserInfo(user_ids).then()
      }
    )
  }

  invite(friendId: string) {
    console.log(`邀请 ${friendId} 加入服务器 ${this.serverId}`);
    this.request.requestInviteUsers(this.serverId,[friendId]).then(response=>{
      if (response){
        alert("邀请成功，该用户成功加入服务器")
      }else {
        alert("邀请失败")
      }
    })
  }

  @Output() close = new EventEmitter<void>(); // ← 添加关闭事件

  onClose() {
    this.close.emit(); // ← 发出关闭事件
  }

}

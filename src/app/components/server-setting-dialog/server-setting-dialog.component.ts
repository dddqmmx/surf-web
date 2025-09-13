import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ImageEditComponent} from "../image-edit/image-edit.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Router} from "@angular/router";
import {ServerProfileSettingComponent} from "../server-profile-setting/server-profile-setting.component";
import {ServerService} from "../../services/api/server.service";

@Component({
  selector: 'app-server-setting-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ImageEditComponent,
    NgIf,
    NgForOf,
    NgClass,
    ServerProfileSettingComponent
  ],
  templateUrl: './server-setting-dialog.component.html',
  styleUrl: './server-setting-dialog.component.css'
})
export class ServerSettingDialogComponent {
  @Input() serverId!: string; // 通过输入属性接收服务器 ID
  selectedIndex: number = 0; // 默认没有选中按钮

  sidebarItems = [
    {label: '服务器资料'},
    {label: '身分组',},
    {label: '成员管理'},
    {label: '安全设置'},
    {label: '解散服务器',action: () => this.dissolveServer(),button: true}
  ];

  constructor(private router: Router,private serverServer:ServerService) {
    this.selectItem(this.selectedIndex)
  }

  selectItem(index: number): void {
    const item = this.sidebarItems[index];
    if (!item.button){
      this.selectedIndex = index;
    }
    if (item.action) {
      item.action();
    }
  }

  @Output() close = new EventEmitter<void>(); // ← 添加关闭事件

  onClose() {
    this.close.emit(); // ← 发出关闭事件
  }

  dissolveServer(){
    alert(this.serverId);
    this.serverServer.deleteServer(this.serverId).then();
  }
}

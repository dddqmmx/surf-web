import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ImageEditComponent} from "../image-edit/image-edit.component";
import {NgIf} from "@angular/common";
import {ServerService} from "../../services/api/server.service";
import {AvatarComponent} from "../avatar/avatar.component";
import {FormsModule} from "@angular/forms";
import {RequestService} from "../../services/request.service";
import {CommonDataService} from "../../services/common-data.service";

type serverInfo = {
  serverName: string | null;
  serverDescription: string | null;
};



@Component({
  selector: 'app-server-profile-setting',
  standalone: true,
  imports: [
    ImageEditComponent,
    NgIf,
    AvatarComponent,
    FormsModule
  ],
  templateUrl: './server-profile-setting.component.html',
  styleUrl: './server-profile-setting.component.css'
})
export class ServerProfileSettingComponent implements OnInit{
  @Input() serverId!: string; // 通过输入属性接收服务器 ID
  @ViewChild('serverIcon') serverIcon!: AvatarComponent;

  imageEditDialog = false;
  file!: File;
  cropped!: string;

  originServerInfo: serverInfo = {
    serverName: null,
    serverDescription: null
  };

  serverInfo: serverInfo = {
    serverName: null,
    serverDescription: null
  };

  constructor(protected serverService:ServerService,protected  request: RequestService,protected commonDataService:CommonDataService) {
  }

  async updateServerInfo() {
    const success = await this.serverService.updatesServerProfile(
      this.serverId,
      this.serverInfo.serverName,
      this.serverInfo.serverDescription
    );
    if (!success) return;

    await this.request.requestServerInfoByIds([this.serverId]); // 等待最新数据

    // 用 Object.assign 保留原对象引用，只更新字段
    Object.assign(
      this.serverService.serverInfo,
      this.commonDataService.getServerInfoById(this.serverId)
    );

    alert("成功更改");
  }


  async selectFile() {
    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Images',
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg', '.gif']
            }
          }
        ],
        multiple: false
      });
      this.file = await fileHandle.getFile();
      this.toggleImageEditDialog();
    } catch (error) {
      console.error('文件选择已取消', error);
    }
  }
  onConfirm(cropped: any) {
    console.log('裁剪完成，结果是：', cropped);
    this.cropped = URL.createObjectURL(cropped);
    this.toggleImageEditDialog();
    this.serverService.uploadIcon(cropped,this.serverId).subscribe({
      next: () => {
        console.log('Upload successful');
        this.serverIcon.refreshAvatar();
      },
      error: err => console.error('Upload failed', err)
    })
  }

  toggleImageEditDialog() {
    this.imageEditDialog = !this.imageEditDialog;
  }

  ngOnInit(): void {
    this.originServerInfo.serverName = this.serverService.serverInfo.name
    this.originServerInfo.serverDescription = this.serverService.serverInfo.description
    this.serverInfo.serverName = this.serverService.serverInfo.name
    this.serverInfo.serverDescription = this.serverService.serverInfo.description
  }

  get hasChanges(): boolean {
    return this.originServerInfo.serverName !== this.serverInfo.serverName ||
      this.originServerInfo.serverDescription !== this.serverInfo.serverDescription;
  }

}

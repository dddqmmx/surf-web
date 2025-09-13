import {Component, Input} from '@angular/core';
import {ImageEditComponent} from "../image-edit/image-edit.component";
import {NgIf} from "@angular/common";
import {ServerService} from "../../services/api/server.service";
import {AvatarComponent} from "../avatar/avatar.component";

@Component({
  selector: 'app-server-profile-setting',
  standalone: true,
  imports: [
    ImageEditComponent,
    NgIf,
    AvatarComponent
  ],
  templateUrl: './server-profile-setting.component.html',
  styleUrl: './server-profile-setting.component.css'
})
export class ServerProfileSettingComponent {
  @Input() serverId!: string; // 通过输入属性接收服务器 ID

  imageEditDialog = false;
  file!: File;
  cropped!: string;

  constructor(private serverService:ServerService) {
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
      },
      error: err => console.error('Upload failed', err)
    })
  }

  toggleImageEditDialog() {
    this.imageEditDialog = !this.imageEditDialog;
  }
}

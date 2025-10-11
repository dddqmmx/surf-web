import {Component, EventEmitter, Output} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {CommonDataService} from "../../services/common-data.service";
import {RequestService} from "../../services/request.service";
import {ImageCropperComponent} from "ngx-image-cropper";
import {ImageEditComponent} from "../image-edit/image-edit.component";
import {ServerService} from "../../services/api/server.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-create-server-dialog',
  standalone: true,
  imports: [
    NgForOf,
    ImageCropperComponent,
    ImageEditComponent,
    NgIf,
    FormsModule
  ],
  templateUrl: './create-server-dialog.component.html',
  styleUrl: './create-server-dialog.component.css'
})
export class CreateServerDialogComponent {
  constructor(protected commonData:CommonDataService,protected request:RequestService,protected serverService:ServerService) {
  }
  @Output() close = new EventEmitter<void>(); // ← 添加关闭事件
  imageEditDialog = false;
  file!: File;
  croppedUrl!: string;
  cropped: any;
  serverName: string | undefined;

  onClose() {
    this.close.emit(); // ← 发出关闭事件
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

  toggleImageEditDialog() {
    this.imageEditDialog = !this.imageEditDialog;
  }
  onConfirm(cropped: any) {
    console.log('裁剪完成，结果是：', cropped);
    this.cropped = cropped;
    this.croppedUrl = URL.createObjectURL(cropped);
    this.toggleImageEditDialog();
  }

  createServer(){
    this.serverService.createServer(this.serverName).then(serverId => {
      if (!serverId) {
        return
      }
      if (this.cropped){
        this.serverService.uploadIcon(this.cropped,serverId).subscribe({
          next: () => {
            console.log('Upload successful');
          },
          error: err => console.error('Upload failed', err)
        })
      }
      this.request.requestServerInfoByIds([serverId]).then();
      this.commonData.servers.push(serverId);
    })
    alert("服务器创建成功")
    this.onClose()
  }


}

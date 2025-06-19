import { Component } from '@angular/core';
import {CommonDataService} from "../../../services/common-data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileService} from "../../../services/file.service";
import {RequestService} from "../../../services/request.service";
import {AvatarComponent} from "../../../components/avatar/avatar.component";

@Component({
  selector: 'app-user-profile-editor',
  standalone: true,
  imports: [
    AvatarComponent
  ],
  templateUrl: './user-profile-editor.component.html',
  styleUrl: './user-profile-editor.component.css'
})
export class UserProfileEditorComponent {

  constructor(
    protected commonData: CommonDataService,
    private request: RequestService,
    protected file: FileService
  ) {}

  async selectImage() {
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
      const file = await fileHandle.getFile();
      await this.request.sendUserAvatar(file);
    } catch (error) {
      console.log('文件选择已取消');
    }
  }
}

import { Component } from '@angular/core';
import {CommonDataService} from "../../../services/common-data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileService} from "../../../services/file.service";
import {RequestService} from "../../../services/request.service";
import {AvatarComponent} from "../../../components/avatar/avatar.component";
import {FormsModule} from "@angular/forms";

type UserProfile = {
  nickname: string | null;
  introduction: string | null;
};

@Component({
  selector: 'app-user-profile-editor',
  standalone: true,
  imports: [
    AvatarComponent,
    FormsModule
  ],
  templateUrl: './user-profile-editor.component.html',
  styleUrl: './user-profile-editor.component.css'
})
export class UserProfileEditorComponent {

  constructor(
    protected commonData: CommonDataService,
    private request: RequestService,
    protected file: FileService
  ) {
    this.originProfile.nickname = commonData.userInfoIndexById[commonData.clientUserId]?.data?.nickname
    this.originProfile.introduction = commonData.userInfoIndexById[commonData.clientUserId]?.introduction
    this.userProfile.nickname = commonData.userInfoIndexById[commonData.clientUserId]?.data?.nickname
    this.userProfile.introduction = commonData.userInfoIndexById[commonData.clientUserId]?.introduction
  }
  originProfile: UserProfile = {
    nickname: null,
    introduction: null
  };

  userProfile: UserProfile = {
    nickname: null,
    introduction: null
  };

  saveUserProfile() {
    const payload: Partial<UserProfile> = {};

    (Object.keys(this.userProfile) as Array<keyof UserProfile>).forEach((key) => {
      if (this.userProfile[key] !== this.originProfile[key]) {
        payload[key] = this.userProfile[key];
      }
    });

    if (Object.keys(payload).length > 0) {
      this.request.requestUpdateUserProfile(payload).then(value => {
        console.log(value)
      });
    }
  }

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

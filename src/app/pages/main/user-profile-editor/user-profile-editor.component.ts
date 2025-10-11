import {Component, EventEmitter, Output} from '@angular/core';
import {CommonDataService} from "../../../services/common-data.service";
import {FileService} from "../../../services/file.service";
import {RequestService} from "../../../services/request.service";
import {AvatarComponent} from "../../../components/avatar/avatar.component";
import {FormsModule} from "@angular/forms";
import {UserService} from "../../../services/api/user.service";
import {AvatarService} from "../../../services/ui/avatar.service";
import {ImageEditComponent} from "../../../components/image-edit/image-edit.component";
import {NgIf} from "@angular/common";
import {Router} from "@angular/router";

type UserProfile = {
  nickname: string | null;
  introduction: string | null;
};

@Component({
  selector: 'app-user-profile-editor',
  standalone: true,
  imports: [
    AvatarComponent,
    FormsModule,
    ImageEditComponent,
    NgIf
  ],
  templateUrl: './user-profile-editor.component.html',
  styleUrl: './user-profile-editor.component.css'
})
export class UserProfileEditorComponent {

  constructor(
    protected commonData: CommonDataService,
    private request: RequestService,
    private userService: UserService,
    protected fileService: FileService,
    protected router: Router,
    private avatarService: AvatarService
  ) {
    this.originProfile.nickname = commonData.userInfoIndexById[commonData.clientUserId].data["nickname"]
    this.originProfile.introduction = commonData.userInfoIndexById[commonData.clientUserId].data["introduction"]
    this.userProfile.nickname = commonData.userInfoIndexById[commonData.clientUserId].data["nickname"]
    this.userProfile.introduction = commonData.userInfoIndexById[commonData.clientUserId].data["introduction"]
  }
  @Output() close = new EventEmitter<void>(); // ← 添加关闭事件
  imageEditDialog = false;
  file!: File;
  cropped!: string;

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
        if (!value) {
          return;
        }
        this.request.getUserInfo([this.commonData.clientUserId], true).then();
        alert("成功更改")
        this.router.navigate(['/main/session']).then();
      });
    }
  }

  backHome(){
    this.router.navigate(['/main/session']).then();
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
      this.file = await fileHandle.getFile();
      this.toggleImageEditDialog()
    } catch (error) {
      console.log('文件选择已取消');
    }
  }

  toggleImageEditDialog() {
    this.imageEditDialog = !this.imageEditDialog;
  }
  onConfirm(cropped: any) {
    this.userService.uploadAvatar(cropped).subscribe({
      next: () => {
        console.log('Upload successful');
        this.avatarService.notifyAvatarChanged(this.commonData.clientUserId)
      },
      error: err => console.error('Upload failed', err)
    })
    this.toggleImageEditDialog();
  }


}

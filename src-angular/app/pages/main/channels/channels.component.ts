import { Component } from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {RouterOutlet} from "@angular/router";
import {CommonDataService} from "../../../services/common-data.service";
import {InviteDialogComponent} from "../../../components/invite-dialog/invite-dialog.component";
import {CreateServerDialogComponent} from "../../../components/create-server-dialog/create-server-dialog.component";
import {AvatarComponent} from "../../../components/avatar/avatar.component";

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterOutlet,
    NgForOf,
    InviteDialogComponent,
    CreateServerDialogComponent,
    NgIf,
    AvatarComponent
  ],
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.css'
})
export class ChannelsComponent {
  constructor(protected commonDataService:CommonDataService) {
  }
  createServerDialog:boolean = false;

  toggleCreateServerDialog() {
    this.createServerDialog = !this.createServerDialog;
  }
}

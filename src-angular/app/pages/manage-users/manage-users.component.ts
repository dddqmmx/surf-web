import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
// import {appDataDir} from "@tauri-apps/api/path";
// import {invoke} from "@tauri-apps/api/core";
import {window} from "rxjs";
import { Location } from '@angular/common';

interface User {
  name: string;
  file: string;
  // 其他用户属性可以根据需要添加
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent implements OnInit{
  showEditUserModal = false
  automaticLogin:number = -1
  users: User[] = []
  editUser: User | undefined

  ngOnInit(): void {
    this.loadUserProfiles().then();
  }

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }

  toShowEditUserModal(index:number){
    this.editUser = this.users[index]
    this.showEditUserModal = true;
  }

  async processProfiles(profiles: unknown) {
    if (typeof profiles !== "string") {
      console.error("Invalid profiles data");
      return;
    }

    const profilesJson = JSON.parse(profiles);
    this.users = profilesJson['user-keys'] || [];
    this.automaticLogin = profilesJson['automatic-login']
  }

  private async loadUserProfiles() {
    // try {
    //   const dir = await appDataDir();
    //   const profiles = await invoke("read_file", {path: `${dir}\\user-profiles.json`});
    //   await this.processProfiles(profiles);
    // } catch (error) {
    //   console.error("Error during initialization:", error);
    // }
  }


  protected readonly window = window;
}

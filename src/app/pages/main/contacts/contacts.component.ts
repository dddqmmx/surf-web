import { Component } from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {Router, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterOutlet
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent {
  constructor(protected router:Router) {
  }
  viewContacts(){
    this.router.navigate(['/main/contacts/user_info']).then();
  }
  viewSearchUser(){
    this.router.navigate(['/main/contacts/search_user']).then();
  }
  viewFriendRequests(){
    this.router.navigate(['/main/contacts/friend_request_list']).then();
  }
}

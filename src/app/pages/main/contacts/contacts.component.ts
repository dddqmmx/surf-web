import {Component, OnInit} from '@angular/core';
import {NgForOf, NgOptimizedImage} from "@angular/common";
import {Router, RouterOutlet} from "@angular/router";
import {RequestService} from "../../../services/request.service";
import {CommonDataService} from "../../../services/common-data.service";

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterOutlet,
    NgForOf
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent implements OnInit {
  constructor(protected router: Router, protected request: RequestService, protected commonData: CommonDataService) {
  }

  viewContacts(userId: string) {
    this.router.navigate(['/main/contacts/user_info'], {queryParams: {"user_id": userId}}).then();
  }

  viewSearchUser() {
    this.router.navigate(['/main/contacts/search_user']).then();
  }

  viewFriendRequests() {
    this.router.navigate(['/main/contacts/friend_request_list']).then();
  }

  ngOnInit(): void {
    this.request.getUserFriends().then(user_ids => {
        this.request.getUserInfo(user_ids).then()
      }
    )
  }

}

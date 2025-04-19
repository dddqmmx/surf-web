import {Routes} from "@angular/router";
import {LoginComponent} from "./pages/login/login.component";
import {MainComponent} from "./pages/main/main.component";
import {ChatComponent} from "./pages/chat/chat.component";
import {SettingsComponent} from "./pages/main/settings/settings.component";
import {UserInfoComponent} from "./pages/user-info/user-info.component";
import {ManageUsersComponent} from "./pages/manage-users/manage-users.component";
import {SessionComponent} from "./pages/main/session/session.component";
import {ContactsComponent} from "./pages/main/contacts/contacts.component";
import {AccountManageComponent} from "./pages/main/settings/account-manage/account-manage.component";
import {RegisterComponent} from "./pages/register/register.component";
import {GeneralSettingsComponent} from "./pages/main/settings/general-settings/general-settings.component";
import {FriendRequestListComponent} from "./pages/main/contacts/friend-request-list/friend-request-list.component";
import {SearchUserComponent} from "./pages/main/contacts/search-user/search-user.component";
import {ChannelsComponent} from "./pages/main/channels/channels.component";
import {GroupsComponent} from "./pages/main/groups/groups.component";
import {ErrorComponent} from "./pages/error/error.component";
export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'preview', component: MainComponent},
  {path: 'login', component: LoginComponent},
  {path: "register", component: RegisterComponent},
  {
    path: 'main', component: MainComponent, children: [
      {
        path: "user_info", component: UserInfoComponent, children: []
      },
      {
        path: "session", component: SessionComponent, children:
          [
            {path: "chat", component: ChatComponent},
          ]
      },
      {
        path: "contacts", component: ContactsComponent, children:
          [
            {path: "search_user", component: SearchUserComponent},
            {path: "friend_request_list", component: FriendRequestListComponent},
            {path: "user_info", component: UserInfoComponent}
          ]
      },
      {
        path: "groups", component: GroupsComponent
      },
      {
        path: "channels", component: ChannelsComponent
      },
      {
        path: "settings", component: SettingsComponent, children:
          [
            {path: "account_manage", component: AccountManageComponent},
            {path: "general_settings", component: GeneralSettingsComponent}
          ]
      },
    ]
  },
  {path: '**', component: ErrorComponent},
];

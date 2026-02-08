import { reactive } from 'vue';

export interface UserInfoCacheEntry {
  data: any;
  timestamp: number;
}

export class UserStore {
  friends: string[] = [];
  userInfoIndexById: Record<string, UserInfoCacheEntry> = {};

  hasUserInfo(id: string) {
    return Object.prototype.hasOwnProperty.call(this.userInfoIndexById, id);
  }

  getUserInfo(id: string) {
    return this.userInfoIndexById[id]?.data;
  }
}

export const userStore = reactive(new UserStore()) as UserStore;

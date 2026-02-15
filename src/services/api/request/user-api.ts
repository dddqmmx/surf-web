import CryptoJS from 'crypto-js';
import { v4 as uuidV4 } from 'uuid';
import { TimedCache } from '../cache';
import { socketService } from '../../socket';
import { authState, devicePreferences, userStore } from '../../state';

type UserInfo = Record<string, any>;

const USER_INFO_CACHE_TTL = 30 * 60 * 1000;

export class UserRequestApi {
  private readonly userInfoCache = new TimedCache<string, UserInfo>({
    ttlMs: USER_INFO_CACHE_TTL,
    maxSize: 2000,
    cleanupIntervalMs: 60 * 1000,
  });

  private readonly pendingUserInfoById = new Map<string, Promise<UserInfo | undefined>>();

  async getUserInfo(ids: string[], forceRefresh = false): Promise<Map<string, UserInfo>> {
    const result = new Map<string, UserInfo>();
    const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))];
    const idsToFetch: string[] = [];
    const pendingTasks: Promise<void>[] = [];

    for (const id of uniqueIds) {
      const cached = this.getCachedUserInfo(id, forceRefresh);
      if (cached !== undefined) {
        result.set(id, cached);
        continue;
      }

      const pending = this.pendingUserInfoById.get(id);
      if (pending) {
        pendingTasks.push(
          pending.then((userInfo) => {
            if (userInfo !== undefined) {
              result.set(id, userInfo);
            }
          })
        );
        continue;
      }

      idsToFetch.push(id);
    }

    if (idsToFetch.length > 0) {
      const batchPromise = this.fetchUserInfoBatch(idsToFetch);

      for (const id of idsToFetch) {
        const perIdPromise = batchPromise.then((batchResult) => batchResult.get(id));
        this.pendingUserInfoById.set(id, perIdPromise);

        perIdPromise.finally(() => {
          if (this.pendingUserInfoById.get(id) === perIdPromise) {
            this.pendingUserInfoById.delete(id);
          }
        });

        pendingTasks.push(
          perIdPromise.then((userInfo) => {
            if (userInfo !== undefined) {
              result.set(id, userInfo);
            }
          })
        );
      }
    }

    if (pendingTasks.length > 0) {
      await Promise.allSettled(pendingTasks);
    }

    return result;
  }

  async requestLogin(account: string | undefined, password: string | undefined): Promise<boolean> {
    try {
      if (!account || !password) {
        throw new Error('Account and password are required');
      }

      const hashed = CryptoJS.MD5(password).toString();
      const response = await socketService.request('user', 'login', {
        account,
        password: hashed,
      });

      if (!response.id) {
        return false;
      }

      authState.clientUserId = response.id;
      devicePreferences.initMicStatus();
      devicePreferences.initSpeakerStatus();
      return true;
    } catch (error) {
      console.error('Login request failed:', error);
      return false;
    }
  }

  async requestRegister(account: string | undefined, password: string | undefined): Promise<boolean> {
    try {
      if (!account || !password) {
        throw new Error('Account and password are required');
      }

      const hashed = CryptoJS.MD5(password).toString();
      const response = await socketService.request('user', 'register', {
        account,
        password: hashed,
      });

      return !!response;
    } catch (error) {
      console.error('Register request failed:', error);
      return false;
    }
  }

  emailCheck(email: string | undefined): void {
    socketService
      .request('email', 'email_check', { email })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error('Request failed:', error);
      });
  }

  async getUserFriends(): Promise<string[]> {
    const response = await socketService.request('user', 'get_user_friends');
    const userIds = Array.isArray(response.user_ids) ? response.user_ids : [];
    userStore.friends = userIds;
    return userIds;
  }

  sendFriendRequest(userId: string): Promise<boolean> {
    return socketService.request('user', 'send_friend_request', { target_user_id: userId });
  }

  async getFriendRequests(): Promise<string[]> {
    const response = await socketService.request('user', 'get_friend_requests');
    return Array.isArray(response.user_ids) ? response.user_ids : [];
  }

  async requestAcceptFriendRequest(userId: string): Promise<boolean> {
    if (!userStore.friends.includes(userId)) {
      userStore.friends.push(userId);
    }

    return socketService.request('user', 'accept_friend_request', {
      target_user_id: userId,
    });
  }

  async sendUserAvatar(
    file: File,
    {
      chunkSize = 32 * 1024,
      concurrency = 4,
    }: { chunkSize?: number; concurrency?: number } = {}
  ): Promise<void> {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const id = uuidV4();

    let index = 0;

    const uploadNext = async () => {
      while (index < totalChunks) {
        const i = index++;
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const buffer = await chunk.arrayBuffer();
        const chunkBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const data: Record<string, unknown> = {
          id,
          index: i,
          chunk: chunkBase64,
        };

        if (i === 0) {
          data.total = totalChunks;
          data.metadata = {
            filename: file.name,
            mimetype: file.type,
          };
        }

        socketService.send('user', 'upload_user_avatar', data);
      }
    };

    await Promise.all(Array(concurrency).fill(0).map(() => uploadNext()));
  }

  async requestUpdateUserProfile(userProfile: Record<string, unknown>): Promise<boolean> {
    const updated = await socketService.request('user', 'update_user_profile', userProfile);
    if (updated && typeof userProfile.user_id === 'string') {
      this.userInfoCache.delete(userProfile.user_id);
    }
    return updated;
  }

  invalidateUserInfo(userId: string): void {
    this.userInfoCache.delete(userId);
    delete userStore.userInfoIndexById[userId];
  }

  private getCachedUserInfo(id: string, forceRefresh: boolean): UserInfo | undefined {
    if (forceRefresh) {
      return undefined;
    }

    const cacheHit = this.userInfoCache.get(id);
    if (cacheHit !== undefined) {
      return cacheHit;
    }

    const storeEntry = userStore.userInfoIndexById[id];
    if (!storeEntry) {
      return undefined;
    }

    const age = Date.now() - storeEntry.timestamp;
    if (age >= USER_INFO_CACHE_TTL) {
      return undefined;
    }

    this.userInfoCache.set(id, storeEntry.data, USER_INFO_CACHE_TTL - age);
    return storeEntry.data;
  }

  private async fetchUserInfoBatch(ids: string[]): Promise<Map<string, UserInfo>> {
    const result = new Map<string, UserInfo>();

    try {
      const response = await socketService.request('user', 'search_user', {
        user_id_list: ids,
      });

      const currentTime = Date.now();
      const users = Array.isArray(response.data) ? response.data : [];

      users.forEach((item: UserInfo) => {
        const userId = item.user_id;
        if (typeof userId !== 'string' || userId.length === 0) {
          return;
        }

        this.userInfoCache.set(userId, item);
        userStore.userInfoIndexById[userId] = {
          data: item,
          timestamp: currentTime,
        };
        result.set(userId, item);
      });
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }

    return result;
  }
}

import { Subject } from 'rxjs';

export class AvatarService {
  private avatarChangedSubject = new Subject<string>();
  avatarChanged$ = this.avatarChangedSubject.asObservable();

  notifyAvatarChanged(userId: string) {
    this.avatarChangedSubject.next(userId);
  }
}

export const avatarService = new AvatarService();

import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor() { }
  private avatarChangedSubject = new Subject<string>(); // userId
  avatarChanged$ = this.avatarChangedSubject.asObservable();

  notifyAvatarChanged(userId: string) {
    this.avatarChangedSubject.next(userId);
  }
}

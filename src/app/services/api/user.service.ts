import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonDataService} from "../common-data.service";
import CryptoJS from "crypto-js";
import {catchError, from, map, Observable, of, switchMap, tap} from "rxjs";
import {SocketService} from "../socket.service";

interface LoginResponse {
  success: boolean;
  session_id: string;
  user_id: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private socket: SocketService,
    private commonData: CommonDataService) {
  }

  public login(account: string | undefined, password: string | undefined): Observable<boolean> {
    console.log("login")
    if (!account || !password) {
      throw new Error('Account and password are required');
    }

    const hashedPassword = CryptoJS.MD5(password).toString();
    const url = `${this.commonData.httpPrefix}/user/login`;

    return this.http.post<LoginResponse>(url, { account, password: hashedPassword }).pipe(
      switchMap(response => {
        if (response.success) {
          this.commonData.sessionId = response.session_id;
          this.commonData.clientUserId = response.user_id;

          // 把 Promise 转换成 Observable
          return from(this.requestSetSession(this.commonData.sessionId)).pipe(
            map(result => result)
          );
        }
        return of(false);
      })
    );
  }

  uploadAvatar(file: File): Observable<boolean> {
    const url = `${this.commonData.httpPrefix}/user/get_avatar_upload_url`;
    return this.http.post<{ upload_url: string }>(url, {
      session_id: this.commonData.sessionId,
    }).pipe(
      switchMap(res => {
        const uploadUrl = res.upload_url;
        console.log(res.upload_url)
        if (!uploadUrl) {
          console.error('[Avatar] 获取 presigned URL 失败');
          return of(false);
        }

        return this.http.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type
          }
        }).pipe(
          tap(() => {
            console.log('[Avatar] 文件上传成功');
          }),
          map(() => true),
          catchError(err => {
            console.error('[Avatar] 上传失败:', err);
            return of(false);
          })
        );
      }),
      catchError(err => {
        console.error('[Avatar] 获取 presigned URL 请求失败:', err);
        return of(false);
      })
    );
  }

  public async requestSetSession(session_id: string | undefined): Promise<boolean> {
    try {
      if (!session_id) {
        throw new Error('session id are required');
      }
      const response = await this.socket.request('user', 'set_session', {
        "session_id": session_id
      })
      this.commonData.initMicStatus()
      this.commonData.initSpeakerStatus()
      return response;
    } catch (error) {
      console.error('Login request failed:', error);
      return false;
    }
  }


}

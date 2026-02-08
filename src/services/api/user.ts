import CryptoJS from 'crypto-js';
import { from, map, of, switchMap, catchError, Observable } from 'rxjs';
import { authState, devicePreferences, networkConfig } from '../state';
import { socketService } from '../socket';

interface LoginResponse {
  success: boolean;
  session_id: string;
  user_id: string;
  [key: string]: any;
}

const postJson = async <T>(url: string, body: any): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};

export class UserService {
  login(account: string | undefined, password: string | undefined): Observable<boolean> {
    if (!account || !password) {
      throw new Error('Account and password are required');
    }

    const hashedPassword = CryptoJS.SHA256(password).toString();
    const url = `${networkConfig.httpPrefix}/user/login`;
    console.log(hashedPassword)
    return from(postJson<LoginResponse>(url, { account, password: hashedPassword })).pipe(
      switchMap((response) => {
        if (response.success) {
          authState.sessionId = response.session_id;
          authState.clientUserId = response.user_id;
          return from(this.requestSetSession(authState.sessionId)).pipe(map((result) => result));
        }
        return of(false);
      }),
      catchError((err) => {
        console.error('Login failed:', err);
        return of(false);
      })
    );
  }

  uploadAvatar(file: File): Observable<boolean> {
    const url = `${networkConfig.httpPrefix}/user/get_avatar_upload_url`;
    return from(
      postJson<{ upload_url: string }>(url, {
        session_id: authState.sessionId,
      })
    ).pipe(
      switchMap((res) => {
        const uploadUrl = res.upload_url;
        if (!uploadUrl) {
          console.error('[Avatar] 获取 presigned URL 失败');
          return of(false);
        }

        return from(
          fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          })
        ).pipe(
          map((putRes) => {
            if (!putRes.ok) {
              throw new Error('Upload failed');
            }
            return true;
          }),
          catchError((err) => {
            console.error('[Avatar] 上传失败:', err);
            return of(false);
          })
        );
      }),
      catchError((err) => {
        console.error('[Avatar] 获取 presigned URL 请求失败:', err);
        return of(false);
      })
    );
  }

  async requestSetSession(session_id: string | undefined): Promise<boolean> {
    try {
      if (!session_id) {
        throw new Error('session id are required');
      }
      const response = await socketService.request('user', 'set_session', {
        session_id,
      });
      devicePreferences.initMicStatus();
      devicePreferences.initSpeakerStatus();
      return response;
    } catch (error) {
      console.error('Login request failed:', error);
      return false;
    }
  }
}

export const userService = new UserService();

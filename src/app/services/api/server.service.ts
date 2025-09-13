import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, firstValueFrom, from, map, Observable, of, switchMap, tap} from "rxjs";
import CryptoJS from "crypto-js";
import {CommonDataService} from "../common-data.service";

interface CreateServerResponse {
  server_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(
    private http: HttpClient,
    private commonData: CommonDataService) {
  }

  public async createServer(servername: string | undefined): Promise<string> {
    const url = `${this.commonData.httpPrefix}/server/create_server`;
    try {
      const response = await firstValueFrom(
        this.http.post<CreateServerResponse>(url, {
          session_id: this.commonData.sessionId,
          servername: servername,
        })
      );
      return response.server_id ?? "";
    } catch (error) {
      console.error("Create server failed:", error);
      return "";
    }
  }

  public async deleteServer(serverId: string): Promise<string> {
    const url = `${this.commonData.httpPrefix}/server/delete_server`;
    try {
      const response = await firstValueFrom(
        this.http.post<CreateServerResponse>(url, {
          session_id: this.commonData.sessionId,
          server_id: serverId,
        })
      );
      return response.server_id ?? "";
    } catch (error) {
      console.error("delete server failed:", error);
      return "";
    }
  }

  uploadIcon(file: File,server_id:string): Observable<boolean> {
    const url = `${this.commonData.httpPrefix}/server/get_icon_upload_url`;
    return this.http.post<{ upload_url: string }>(url, {
      session_id: this.commonData.sessionId,
      server_id: server_id
    }).pipe(
      switchMap(res => {
        const uploadUrl = res.upload_url;
        console.log(res.upload_url)
        if (!uploadUrl) {
          console.error('[Icon] 获取 presigned URL 失败');
          return of(false);
        }

        return this.http.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type
          }
        }).pipe(
          tap(() => {
            console.log('[Icon] 文件上传成功');
          }),
          map(() => true),
          catchError(err => {
            console.error('[Icon] 上传失败:', err);
            return of(false);
          })
        );
      }),
      catchError(err => {
        console.error('[Icon] 获取 presigned URL 请求失败:', err);
        return of(false);
      })
    );
  }

}

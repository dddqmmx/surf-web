import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, firstValueFrom, from, map, Observable, of, switchMap, tap} from "rxjs";
import CryptoJS from "crypto-js";
import {CommonDataService} from "../common-data.service";

interface CreateServerResponse {
  server_id: string;
}

interface GetServerMemberIdsResponse {
  user_ids: string[];
}

export interface Role {
  name: string;
  level: number;
  permissions: number[];
}

interface GetServerRolesResponse {
  role_map: Record<string, Role>
}

interface GetMembersRolesResponse {
  members_roles_map: Record<string, string[]>
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

  public async getServerMemberIds(serverId: string): Promise<string[]> {
    const url = `${this.commonData.httpPrefix}/server/get_server_member_ids`;
    try {
      const response = await firstValueFrom(
        this.http.post<GetServerMemberIdsResponse>(url, {
          session_id: this.commonData.sessionId,
          server_id: serverId,
        })
      );
      return response.user_ids ?? [];
    } catch (error) {
      console.error("failed:", error);
      return [];
    }
  }

  public async getServerRoles(serverId: string): Promise<Record<string, Role>> {
    const url = `${this.commonData.httpPrefix}/server/get_server_roles`;
    try {
      const response = await firstValueFrom(
        this.http.post<GetServerRolesResponse>(url, {
          session_id: this.commonData.sessionId,
          server_id: serverId,
        })
      );
      console.log(response)
      return response.role_map;
    } catch (error) {
      console.error("failed:", error);
      return {};
    }
  }

  public async getMembersRoles(serverId: string, user_ids: string[]): Promise<Record<string, string[]>> {
    const url = `${this.commonData.httpPrefix}/server/get_members_roles`;
    try {
      const response = await firstValueFrom(
        this.http.post<GetMembersRolesResponse>(url, {
          server_id: serverId,
          user_ids: user_ids
        })
      );
      return response.members_roles_map;
    } catch (error) {
      console.error("delete server failed:", error);
      return {};
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

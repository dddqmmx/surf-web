import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, catchError, firstValueFrom, from, map, Observable, of, switchMap, tap} from "rxjs";
import CryptoJS from "crypto-js";
import {CommonDataService} from "../common-data.service";
import {SocketService} from "../socket.service";

interface CreateServerResponse {
  server_id: string;
}

interface UpdatesServerProfileResponse {
  success: boolean;
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

export interface MemberGroup {
  roleName: string;
  userIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  public serverInfo:any = null;


  public currentRolePermissions: number[] = [];

  private memberDataSubject = new BehaviorSubject<{
    memberIds: string[];
    memberRolesRecord: Record<string, string[]>;
    rolesRecord: Record<string, Role>;
  } | null>(null);

  public memberData$ = this.memberDataSubject.asObservable();

  async updatesServerProfile(server_id: string | null, servername: string | null, description: string | null): Promise<boolean> {
    const url = `${this.commonData.httpPrefix}/server/update_server_profile`;
    try {
      const response = await firstValueFrom(
        this.http.post<UpdatesServerProfileResponse>(url, {
          server_id: server_id,
          servername: servername,
          description: description
        })
      );
      return response.success
    } catch (error) {
      console.error("Create server failed:", error);
      return false;
    }
  }

  // 提供更新方法
  updateMemberData(data: {
    memberIds: string[];
    memberRolesRecord: Record<string, string[]>;
    rolesRecord: Record<string, Role>;
  }) {
    this.memberDataSubject.next(data);
  }

  // 保留原有属性供直接访问
  get memberIds(): string[] {
    return this.memberDataSubject.value?.memberIds || [];
  }

  get memberRolesRecord(): Record<string, string[]> {
    return this.memberDataSubject.value?.memberRolesRecord || {};
  }

  get rolesRecord(): Record<string, Role> {
    return this.memberDataSubject.value?.rolesRecord || {};
  }

  constructor(
    private http: HttpClient,
    private commonData: CommonDataService,
    private socket: SocketService) {
  }

  // 添加新用户
  addUsers(userIds: string[], memberRolesRecord: Record<string, string[]>) {
    const current = this.memberDataSubject.value;
    if (!current) return;

    const newMemberIds = [...current.memberIds, ...userIds];
    const newMemberRolesRecord = { ...current.memberRolesRecord, ...memberRolesRecord };

    this.updateMemberData({
      memberIds: newMemberIds,
      memberRolesRecord: newMemberRolesRecord,
      rolesRecord: current.rolesRecord
    });
  }

  // 移除用户
  removeUser(userId: string) {
    const current = this.memberDataSubject.value;
    if (!current) return;

    const newMemberIds = current.memberIds.filter(id => id !== userId);
    const newMemberRolesRecord = { ...current.memberRolesRecord };
    delete newMemberRolesRecord[userId];

    this.updateMemberData({
      memberIds: newMemberIds,
      memberRolesRecord: newMemberRolesRecord,
      rolesRecord: current.rolesRecord
    });
  }

  public leaveServer(serverId: string) {
    this.socket.send("server","leave_server",{
      "server_id":serverId,
    })
  }

  public getUserPermissions(userId: string): number[] {
    const roleIds = this.memberRolesRecord[userId] || [];
    const permissionsSet = new Set<number>();
    for (const roleId of roleIds) {
      const role = this.rolesRecord[roleId];
      if (role?.permissions) {
        for (const perm of role.permissions) {
          permissionsSet.add(perm);
        }
      }
    }
    return Array.from(permissionsSet);
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

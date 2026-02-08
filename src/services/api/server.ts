import { reactive } from 'vue';
import { BehaviorSubject, catchError, from, map, of, switchMap, Observable } from 'rxjs';
import { authState, networkConfig } from '../state';
import { socketService } from '../socket';

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
  role_map: Record<string, Role>;
}

interface GetMembersRolesResponse {
  members_roles_map: Record<string, string[]>;
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

export class ServerService {
  serverInfo: any = null;
  currentRolePermissions: number[] = [];

  private memberDataSubject = new BehaviorSubject<{
    memberIds: string[];
    memberRolesRecord: Record<string, string[]>;
    rolesRecord: Record<string, Role>;
  } | null>(null);

  memberData$ = this.memberDataSubject.asObservable();

  async updatesServerProfile(
    server_id: string | null,
    servername: string | null,
    description: string | null
  ): Promise<boolean> {
    const url = `${networkConfig.httpPrefix}/server/update_server_profile`;
    try {
      const response = await postJson<UpdatesServerProfileResponse>(url, {
        server_id,
        servername,
        description,
      });
      return response.success;
    } catch (error) {
      console.error('Create server failed:', error);
      return false;
    }
  }

  updateMemberData(data: {
    memberIds: string[];
    memberRolesRecord: Record<string, string[]>;
    rolesRecord: Record<string, Role>;
  }) {
    this.memberDataSubject.next(data);
  }

  get memberIds(): string[] {
    return this.memberDataSubject.value?.memberIds || [];
  }

  get memberRolesRecord(): Record<string, string[]> {
    return this.memberDataSubject.value?.memberRolesRecord || {};
  }

  get rolesRecord(): Record<string, Role> {
    return this.memberDataSubject.value?.rolesRecord || {};
  }

  addUsers(userIds: string[], memberRolesRecord: Record<string, string[]>) {
    const current = this.memberDataSubject.value;
    if (!current) return;

    const newMemberIds = [...current.memberIds, ...userIds];
    const newMemberRolesRecord = { ...current.memberRolesRecord, ...memberRolesRecord };

    this.updateMemberData({
      memberIds: newMemberIds,
      memberRolesRecord: newMemberRolesRecord,
      rolesRecord: current.rolesRecord,
    });
  }

  removeUser(userId: string) {
    const current = this.memberDataSubject.value;
    if (!current) return;

    const newMemberIds = current.memberIds.filter((id) => id !== userId);
    const newMemberRolesRecord = { ...current.memberRolesRecord };
    delete newMemberRolesRecord[userId];

    this.updateMemberData({
      memberIds: newMemberIds,
      memberRolesRecord: newMemberRolesRecord,
      rolesRecord: current.rolesRecord,
    });
  }

  leaveServer(serverId: string) {
    socketService.send('server', 'leave_server', {
      server_id: serverId,
    });
  }

  getUserPermissions(userId: string): number[] {
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

  async createServer(servername: string | undefined): Promise<string> {
    const url = `${networkConfig.httpPrefix}/server/create_server`;
    try {
      const response = await postJson<CreateServerResponse>(url, {
        session_id: authState.sessionId,
        servername,
      });
      return response.server_id ?? '';
    } catch (error) {
      console.error('Create server failed:', error);
      return '';
    }
  }

  async deleteServer(serverId: string): Promise<string> {
    const url = `${networkConfig.httpPrefix}/server/delete_server`;
    try {
      const response = await postJson<CreateServerResponse>(url, {
        session_id: authState.sessionId,
        server_id: serverId,
      });
      return response.server_id ?? '';
    } catch (error) {
      console.error('delete server failed:', error);
      return '';
    }
  }

  async getServerMemberIds(serverId: string): Promise<string[]> {
    const url = `${networkConfig.httpPrefix}/server/get_server_member_ids`;
    try {
      const response = await postJson<GetServerMemberIdsResponse>(url, {
        session_id: authState.sessionId,
        server_id: serverId,
      });
      return response.user_ids ?? [];
    } catch (error) {
      console.error('failed:', error);
      return [];
    }
  }

  async getServerRoles(serverId: string): Promise<Record<string, Role>> {
    const url = `${networkConfig.httpPrefix}/server/get_server_roles`;
    try {
      const response = await postJson<GetServerRolesResponse>(url, {
        session_id: authState.sessionId,
        server_id: serverId,
      });
      return response.role_map;
    } catch (error) {
      console.error('failed:', error);
      return {};
    }
  }

  async getMembersRoles(serverId: string, user_ids: string[]): Promise<Record<string, string[]>> {
    const url = `${networkConfig.httpPrefix}/server/get_members_roles`;
    try {
      const response = await postJson<GetMembersRolesResponse>(url, {
        server_id: serverId,
        user_ids,
      });
      return response.members_roles_map;
    } catch (error) {
      console.error('delete server failed:', error);
      return {};
    }
  }

  uploadIcon(file: File, server_id: string): Observable<boolean> {
    const url = `${networkConfig.httpPrefix}/server/get_icon_upload_url`;
    return from(
      postJson<{ upload_url: string }>(url, {
        session_id: authState.sessionId,
        server_id,
      })
    ).pipe(
      switchMap((res) => {
        const uploadUrl = res.upload_url;
        if (!uploadUrl) {
          console.error('[Icon] 获取 presigned URL 失败');
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
            console.error('[Icon] 上传失败:', err);
            return of(false);
          })
        );
      }),
      catchError((err) => {
        console.error('[Icon] 获取 presigned URL 请求失败:', err);
        return of(false);
      })
    );
  }
}

export const serverService = reactive(new ServerService()) as ServerService;

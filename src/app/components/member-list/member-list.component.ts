import { Component, OnInit } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { NgForOf, NgIf } from '@angular/common';
import { CommonDataService } from '../../services/common-data.service';
import { ServerService, Role } from '../../services/api/server.service';

interface MemberGroup {
  roleName: string;
  userIds: string[];
}

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    AvatarComponent,
    NgIf,
    NgForOf
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {
  public membersByRole: MemberGroup[] = [];

  constructor(
    protected commonData: CommonDataService,
    protected serverService: ServerService
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.commonData.currentServer) {
      return;
    }

    try {
      await this.loadAndGroupMembers();
    } catch (error) {
      console.error('加载成员列表失败:', error);
    }
  }

  /**
   * 加载并分组成员数据
   */
  private async loadAndGroupMembers(): Promise<void> {
    const [memberIds, memberRolesRecord, rolesRecord] = await Promise.all([
      this.serverService.getServerMemberIds(this.commonData.currentServer!),
      this.getMemberRoles(),
      this.getServerRoles()
    ]);

    const roleMap = this.createRoleMap(rolesRecord);

    const memberGroups = this.groupMembersByHighestRole(memberIds, memberRolesRecord, roleMap);

    this.membersByRole = this.convertToTemplateFormat(memberGroups, roleMap);
  }

  /**
   * 获取成员角色映射
   */
  private async getMemberRoles(): Promise<Record<string, string[]>> {
    const memberIds = await this.serverService.getServerMemberIds(this.commonData.currentServer!);
    return this.serverService.getMembersRoles(this.commonData.currentServer!, memberIds);
  }

  /**
   * 获取服务器角色信息
   */
  private async getServerRoles(): Promise<Record<string, Role>> {
    return this.serverService.getServerRoles(this.commonData.currentServer!);
  }

  /**
   * 创建角色ID到角色对象的映射
   */
  private createRoleMap(rolesRecord: Record<string, Role>): Map<string, Role> {
    const roleMap = new Map<string, Role>();

    Object.entries(rolesRecord).forEach(([roleId, role]) => {
      roleMap.set(roleId, role);
    });

    return roleMap;
  }

  /**
   * 按用户的最高等级角色进行分组
   */
  private groupMembersByHighestRole(
    memberIds: string[],
    memberRolesRecord: Record<string, string[]>,
    roleMap: Map<string, Role>
  ): Map<string, string[]> {
    const memberGroups = new Map<string, string[]>();

    // 使用 server 返回的 memberIds 保证成员顺序稳定
    for (const userId of memberIds) {
      const roleIds = memberRolesRecord[userId];
      if (!roleIds || roleIds.length === 0) continue;
      console.log("roleIds",roleIds)

      const highestRole = this.findHighestRole(roleIds, roleMap);
      if (!highestRole) continue;
      console.log("name",highestRole.name,"level",highestRole.level)

      this.addUserToGroup(memberGroups, highestRole.name, userId);
    }

    return memberGroups;
  }

  /**
   * 找到用户的最高等级角色
   */
  private findHighestRole(roleIds: string[], roleMap: Map<string, Role>): Role | null {
    let highest: Role | null = null;

    for (const roleId of roleIds) {
      const role = roleMap.get(roleId);
      if (!role) continue;

      if (!highest) {
        highest = role;
        continue;
      }

      // level 数值越大优先级越高
      if ((role.level ?? 0) > (highest.level ?? 0)) {
        highest = role;
      }
    }

    return highest;
  }

  /**
   * 将用户添加到对应的角色分组中
   */
  private addUserToGroup(
    memberGroups: Map<string, string[]>,
    roleName: string,
    userId: string
  ): void {
    if (!memberGroups.has(roleName)) {
      memberGroups.set(roleName, []);
    }

    memberGroups.get(roleName)!.push(userId);
  }

  /**
   * 将Map格式转换为模板可用的数组格式，并按角色优先级排序
   */
  private convertToTemplateFormat(memberGroups: Map<string, string[]>, roleMap: Map<string, Role>): MemberGroup[] {
    // 先获取所有角色并按 level 排序，确保稳定的排序基础
    const sortedRoles = Array.from(roleMap.values())
      .sort((a, b) => {
        const levelA = a.level ?? 0;
        const levelB = b.level ?? 0;
        // level 数值越大排前面
        if (levelA !== levelB) {
          return levelB - levelA;
        }
        // 如果 level 相同，按名称排序保证稳定性
        return a.name.localeCompare(b.name);
      });

    // 按排序后的角色顺序构建结果数组
    const result: MemberGroup[] = [];

    for (const role of sortedRoles) {
      const userIds = memberGroups.get(role.name);
      if (userIds && userIds.length > 0) {
        result.push({
          roleName: role.name,
          userIds: userIds.slice() // 复制数组
        });
      }
    }

    return result;
  }
}

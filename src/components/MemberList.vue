<template>
  <div v-if="membersByRole.length" class="member-list">
    <div v-for="role in membersByRole" :key="role.roleName" class="role-section">
      <div class="role-header">
        <p>{{ role.roleName }}</p>
      </div>
      <div class="member-items">
        <div v-for="userId in role.userIds" :key="userId" class="member-item">
          <Avatar class="avatar" :id="userId" type="user" />
          <span class="member-name">{{ userStore.userInfoIndexById[userId]?.data?.nickname || userId }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Subscription } from 'rxjs';
import Avatar from './Avatar.vue';
import { serverStore, userStore } from '@/services/state';
import { serverService, type Role } from '@/services/api/server';
import { requestService } from '@/services/request';

interface MemberGroup {
  roleName: string;
  userIds: string[];
}

const membersByRole = ref<MemberGroup[]>([]);
const subscriptions: Subscription[] = [];

const loadAndGroupMembers = (data: {
  memberIds: string[];
  memberRolesRecord: Record<string, string[]>;
  rolesRecord: Record<string, Role>;
}) => {
  requestService.getUserInfo(data.memberIds).then();

  const roleMap = createRoleMap(data.rolesRecord);
  const memberGroups = groupMembersByHighestRole(data.memberIds, data.memberRolesRecord, roleMap);
  membersByRole.value = convertToTemplateFormat(memberGroups, roleMap);
};

const createRoleMap = (rolesRecord: Record<string, Role>): Map<string, Role> => {
  const roleMap = new Map<string, Role>();
  Object.entries(rolesRecord).forEach(([roleId, role]) => {
    roleMap.set(roleId, role);
  });
  return roleMap;
};

const groupMembersByHighestRole = (
  memberIds: string[],
  memberRolesRecord: Record<string, string[]>,
  roleMap: Map<string, Role>
): Map<string, string[]> => {
  const memberGroups = new Map<string, string[]>();
  for (const userId of memberIds) {
    const roleIds = memberRolesRecord[userId];
    if (!roleIds || roleIds.length === 0) continue;
    const highestRole = findHighestRole(roleIds, roleMap);
    if (!highestRole) continue;
    addUserToGroup(memberGroups, highestRole.name, userId);
  }
  return memberGroups;
};

const findHighestRole = (roleIds: string[], roleMap: Map<string, Role>): Role | null => {
  let highest: Role | null = null;
  for (const roleId of roleIds) {
    const role = roleMap.get(roleId);
    if (!role) continue;
    if (!highest) {
      highest = role;
      continue;
    }
    if ((role.level ?? 0) > (highest.level ?? 0)) {
      highest = role;
    }
  }
  return highest;
};

const addUserToGroup = (memberGroups: Map<string, string[]>, roleName: string, userId: string) => {
  if (!memberGroups.has(roleName)) {
    memberGroups.set(roleName, []);
  }
  memberGroups.get(roleName)!.push(userId);
};

const convertToTemplateFormat = (memberGroups: Map<string, string[]>, roleMap: Map<string, Role>): MemberGroup[] => {
  const sortedRoles = Array.from(roleMap.values()).sort((a, b) => {
    const levelA = a.level ?? 0;
    const levelB = b.level ?? 0;
    if (levelA !== levelB) {
      return levelB - levelA;
    }
    return a.name.localeCompare(b.name);
  });

  const result: MemberGroup[] = [];
  for (const role of sortedRoles) {
    const userIds = memberGroups.get(role.name);
    if (userIds && userIds.length > 0) {
      result.push({
        roleName: role.name,
        userIds: userIds.slice(),
      });
    }
  }
  return result;
};

onMounted(() => {
  if (!serverStore.currentServer) {
    return;
  }
  const sub = serverService.memberData$.subscribe((data) => {
    if (data) {
      loadAndGroupMembers(data);
    }
  });
  subscriptions.push(sub);
});

onBeforeUnmount(() => {
  subscriptions.forEach((subscription) => subscription.unsubscribe());
});
</script>

<style scoped>
.member-list {
  flex: 0 0 auto;
  width: auto;
  min-width: 200px;
  max-width: 300px;
  overflow: auto;
  border-left: 0.1rem solid #acacac;
  background-color: white;
  color: #000000;
  padding-right: 10px;
  padding-left: 10px;
}

.role-section {
  margin-top: 15px;
}

.role-header {
  margin-bottom: 5px;
}

.member-items {
  display: flex;
  flex-direction: column;
}

.member-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  padding: 3px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.member-item:hover {
  border-radius: 5px;
  background-color: #b5b5b5;
}

.avatar {
  height: 32px;
  width: 32px;
  border-radius: 10px;
  margin-right: 10px;
}

.member-name {
  font-size: 16px;
  color: #3b96ff;
  font-weight: bold;
}
</style>

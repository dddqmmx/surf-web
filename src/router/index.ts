import { createRouter, createWebHistory } from 'vue-router';
import { authState } from '@/services/state';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/preview', component: () => import('@/pages/main/user-profile-editor/UserProfileEditor.vue') },
    { path: '/login', component: () => import('@/pages/login/Login.vue') },
    { path: '/register', component: () => import('@/pages/register/Register.vue') },
    { path: '/manage-users', component: () => import('@/pages/manage-users/ManageUsers.vue') },
    {
      path: '/main',
      component: () => import('@/pages/main/Main.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: 'user_profile_editor', component: () => import('@/pages/main/user-profile-editor/UserProfileEditor.vue') },
        { path: 'user_info', component: () => import('@/pages/user-info/UserInfo.vue') },
        {
          path: 'session',
          component: () => import('@/pages/main/session/Session.vue'),
          children: [
            { path: 'chat', component: () => import('@/pages/chat/Chat.vue') },
          ],
        },
        {
          path: 'contacts',
          component: () => import('@/pages/main/contacts/Contacts.vue'),
          children: [
            { path: 'search_user', component: () => import('@/pages/main/contacts/search-user/SearchUser.vue') },
            { path: 'friend_request_list', component: () => import('@/pages/main/contacts/friend-request-list/FriendRequestList.vue') },
            { path: 'user_info', component: () => import('@/pages/user-info/UserInfo.vue') },
          ],
        },
        { path: 'groups', component: () => import('@/pages/main/groups/Groups.vue') },
        { path: 'channels', component: () => import('@/pages/main/channels/Channels.vue') },
        {
          path: 'settings',
          component: () => import('@/pages/main/settings/Settings.vue'),
          children: [
            { path: 'account_manage', component: () => import('@/pages/main/settings/account-manage/AccountManage.vue') },
            { path: 'general_settings', component: () => import('@/pages/main/settings/general-settings/GeneralSettings.vue') },
          ],
        },
      ],
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/pages/error/Error.vue') },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authState.clientUserId) {
    return { path: '/login' };
  }
  return true;
});

export default router;

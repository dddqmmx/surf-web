import { reactive } from 'vue';

export class AuthState {
  sessionId = '';
  clientUserId = '';
}

export const authState = reactive(new AuthState()) as AuthState;

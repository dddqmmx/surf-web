import { reactive } from 'vue';

export class UiState {
  isMobile = false;
}

export const uiState = reactive(new UiState()) as UiState;

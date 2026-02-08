import { reactive } from 'vue';

export class LayoutState {
  persistent = true;
  secondary = true;
  primary = true;
}

export const layoutState = reactive(new LayoutState()) as LayoutState;

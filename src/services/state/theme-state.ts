import { reactive } from 'vue';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme-mode';

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === 'light' || value === 'dark';
};

const applyThemeToDocument = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = mode;
};

const getPreferredTheme = (): ThemeMode => {
  const persisted = localStorage.getItem(THEME_STORAGE_KEY);
  if (isThemeMode(persisted)) {
    return persisted;
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export class ThemeState {
  mode: ThemeMode = 'light';

  setTheme(mode: ThemeMode) {
    this.mode = mode;
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyThemeToDocument(mode);
  }

  toggleTheme() {
    this.setTheme(this.mode === 'light' ? 'dark' : 'light');
  }

  initializeTheme() {
    this.mode = getPreferredTheme();
    applyThemeToDocument(this.mode);
  }
}

export const themeState = reactive(new ThemeState()) as ThemeState;

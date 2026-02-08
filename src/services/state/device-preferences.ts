import { reactive } from 'vue';
import { authState } from './auth-state';

export class DevicePreferences {
  micEnabled = false;
  speakerEnabled = true;

  get micEnabledKey() {
    return `micEnabled-${authState.clientUserId}`;
  }

  get speakerEnabledKey() {
    return `speakerEnabled-${authState.clientUserId}`;
  }

  initMicStatus() {
    this.micEnabled = JSON.parse(localStorage.getItem(this.micEnabledKey) || 'false');
  }

  initSpeakerStatus() {
    this.speakerEnabled = JSON.parse(localStorage.getItem(this.speakerEnabledKey) || 'false');
  }

  toggleMic(): void {
    this.micEnabled = !this.micEnabled;
    localStorage.setItem(this.micEnabledKey, String(this.micEnabled));
  }

  toggleSpeaker(): void {
    this.speakerEnabled = !this.speakerEnabled;
    localStorage.setItem(this.speakerEnabledKey, String(this.speakerEnabled));
  }
}

export const devicePreferences = reactive(new DevicePreferences()) as DevicePreferences;

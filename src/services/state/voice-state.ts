import { reactive } from 'vue';

export class VoiceState {
  voiceChatting = false;
  voiceChannel = '';
}

export const voiceState = reactive(new VoiceState()) as VoiceState;

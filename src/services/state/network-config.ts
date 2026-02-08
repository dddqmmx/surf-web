import { reactive } from 'vue';

export class NetworkConfig {
  host = 'localhost';
  sslEnabled = false;

  get httpPrefix(): string {
    return this.sslEnabled ? `https://${this.host}:8080` : `http://${this.host}:8080`;
  }

  get websocketUrl(): string {
    return this.sslEnabled ? `wss://${this.host}:8080/ws` : `ws://${this.host}:8080/ws`;
  }
}

export const networkConfig = reactive(new NetworkConfig()) as NetworkConfig;

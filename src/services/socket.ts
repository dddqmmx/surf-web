import { Subject } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';

export class SocketService {
  private socket: WebSocket | null = null;
  pathMap = new Map<string, Map<string, Subject<any>>>();
  private pendingRequests = new Map<
    string,
    { resolve: (data: any) => void; reject: (error: any) => void; timeout: ReturnType<typeof setTimeout> }
  >();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  addMessageSubject(path: string, command: string, subject: Subject<any>) {
    if (!this.pathMap.has(path)) {
      this.pathMap.set(path, new Map());
    }
    const commandMap = this.pathMap.get(path)!;
    commandMap.set(command, subject);
  }

  getMessageSubject(path: string, command: string): Subject<any> {
    const commandMap = this.pathMap.get(path);
    if (commandMap && commandMap.get(command)) {
      return commandMap.get(command)!;
    }
    const messageSubject = new Subject<any>();
    this.addMessageSubject(path, command, messageSubject);
    return messageSubject;
  }

  existMessageSubject(path: string, command: string) {
    const commandMap = this.pathMap.get(path);
    return !!(commandMap && commandMap.has(command));
  }

  initializeMainConnection(serverAddress: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.socket) {
        if (this.socket.readyState === WebSocket.OPEN) {
          resolve(true);
          return;
        }
        this.socket.close();
        this.socket = null;
      }

      try {
        this.socket = new WebSocket(serverAddress);

        const timeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            this.socket?.close();
            this.socket = null;
            reject(new Error('Connection timeout'));
          }
        }, 5000);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          resolve(true);
          this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
              this.send('system', 'ping');
            }
          }, 10000);
        };

        this.socket.onmessage = (event: MessageEvent<any>) => {
          try {
            const jsonMessage = JSON.parse(event.data);
            const { path, command, request_id, data } = jsonMessage;

            if (request_id && this.pendingRequests.has(request_id)) {
              const pending = this.pendingRequests.get(request_id)!;
              clearTimeout(pending.timeout);
              this.pendingRequests.delete(request_id);
              pending.resolve(data);
            } else {
              const messageSubject = this.getMessageSubject(path, command);
              messageSubject.next(jsonMessage['data']);
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        };

        this.socket.onclose = (event: CloseEvent) => {
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
          }
          this.pathMap.forEach((commandMap) => {
            commandMap.forEach((subject) => subject.complete());
            commandMap.clear();
          });
          this.pathMap.clear();
          this.socket = null;

          if (!event.wasClean) {
            console.error(`WebSocket connection closed abnormally. Code: ${event.code}, Reason: ${event.reason}`);
          }
        };

        this.socket.onerror = (error: Event) => {
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
          }
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          this.socket = null;
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reject(error as Error);
      }
    });
  }

  send(path: string, command: string, data: any = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    const message = { path, command, data };
    this.socket.send(JSON.stringify(message));
  }

  request(path: string, command: string, data: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const request_id = uuidV4();

      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request_id);
        reject(new Error('Request timed out'));
        console.log(path, command);
      }, 10000);

      this.pendingRequests.set(request_id, { resolve, reject, timeout });

      const message = { path, command, request_id, data };
      this.socket.send(JSON.stringify(message));
    });
  }
}

export const socketService = new SocketService();

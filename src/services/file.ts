import { BehaviorSubject, Subscription } from 'rxjs';
import { socketService } from './socket';

export enum FileType {
  AVATAR = 'AVATAR',
  IMAGE = 'IMAGE',
}

interface FileEntry {
  chunks: Uint8Array[];
  total: number;
  received: number;
  timestamp: number;
}

interface CompletedFile {
  data: Uint8Array;
  timestamp: number;
  url?: string;
}

export class FileService {
  private caches: Record<FileType, Map<string, FileEntry>>;
  public completedFiles: Record<FileType, Record<string, CompletedFile>>;

  private fileStatusSubjects: Record<FileType, Record<string, BehaviorSubject<string>>> = {
    [FileType.AVATAR]: {},
    [FileType.IMAGE]: {},
  };

  private readonly cleanupInterval: ReturnType<typeof setInterval>;
  private subscriptions: Subscription[] = [];

  constructor() {
    this.caches = {
      [FileType.AVATAR]: new Map(),
      [FileType.IMAGE]: new Map(),
    };

    this.completedFiles = {
      [FileType.AVATAR]: {},
      [FileType.IMAGE]: {},
    };

    this.cleanupInterval = setInterval(() => this.cleanupOldEntries(), 30000);

    this.subscriptions.push(
      socketService.getMessageSubject('user', 'get_user_avatars').subscribe((message) => {
        this.receiveChunk(message['id'], FileType.AVATAR, message['index'], message['chunk'], message['total']);
      })
    );

    this.subscriptions.push(
      socketService.getMessageSubject('file', 'get_image').subscribe((message) => {
        this.receiveChunk(message['image_id'], FileType.IMAGE, message['index'], message['chunk'], message['total']);
      })
    );
  }

  private receiveChunk(id: string, type: FileType, index: number, chunk: string, total: number) {
    const cache = this.caches[type];
    if (!cache.has(id)) {
      if (total === undefined) {
        console.error(`[${type}:${id}] 收到非首分片但缓存未初始化`);
        return;
      }
      cache.set(id, {
        chunks: Array(total).fill(null),
        total,
        received: 0,
        timestamp: Date.now(),
      });
    }
    const fileEntry = cache.get(id)!;

    try {
      const decodedString = atob(chunk);
      const decodedChunk = new Uint8Array(decodedString.length);
      for (let i = 0; i < decodedString.length; i++) {
        decodedChunk[i] = decodedString.charCodeAt(i);
      }
      fileEntry.chunks[index] = decodedChunk;
    } catch (error) {
      console.error(`[${type}:${id}] 分片 ${index} 的 Base64 解码失败`, error);
      return;
    }

    fileEntry.received++;
    fileEntry.timestamp = Date.now();

    if (fileEntry.received === fileEntry.total) {
      this.reconstructFile(id, type);
    }
  }

  private reconstructFile(id: string, type: FileType) {
    const cache = this.caches[type];
    if (!cache.has(id)) return;

    const fileEntry = cache.get(id)!;

    if (fileEntry.chunks.some((chunk) => chunk === null)) {
      console.error(`[${type}:${id}] 检测到缺失的分片`);
      cache.delete(id);
      return;
    }

    try {
      const totalLength = fileEntry.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const completeData = new Uint8Array(totalLength);
      let offset = 0;

      for (const chunk of fileEntry.chunks) {
        completeData.set(chunk, offset);
        offset += chunk.length;
      }

      this.completedFiles[type][id] = { data: completeData, timestamp: Date.now() };
      this.createFileUrl(type, id);
      cache.delete(id);
    } catch (error) {
      console.error(`[${type}:${id}] 文件合并失败`, error);
      cache.delete(id);
    }
  }

  private createFileUrl(type: FileType, id: string) {
    const file = this.completedFiles[type][id];
    if (!file || !file.data) return;

    const blob = new Blob([file.data]);
    file.url = URL.createObjectURL(blob);

    if (this.fileStatusSubjects[type][id]) {
      this.fileStatusSubjects[type][id].next(file.url);
    }
  }

  downloadBlob(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  private cleanupOldEntries() {
    const now = Date.now();

    Object.values(this.caches).forEach((cache) => {
      for (const [id, entry] of cache.entries()) {
        if (now - entry.timestamp > 60000) {
          cache.delete(id);
          console.warn(`文件 ${id} 因超时未完成分片而被丢弃。`);
        }
      }
    });
  }

  getFileData(type: FileType, id: string): Uint8Array | undefined {
    const file = this.completedFiles[type][id];
    return file ? file.data : undefined;
  }

  dispose() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    clearInterval(this.cleanupInterval);

    Object.keys(this.completedFiles).forEach((typeKey) => {
      const type = typeKey as FileType;
      Object.values(this.completedFiles[type]).forEach((file) => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
    });

    Object.keys(this.fileStatusSubjects).forEach((typeKey) => {
      const type = typeKey as FileType;
      Object.values(this.fileStatusSubjects[type]).forEach((subject) => {
        subject.complete();
      });
    });
  }
}

export const fileService = new FileService();

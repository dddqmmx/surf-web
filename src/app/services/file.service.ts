import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { SocketService } from "./socket.service";

export enum FileType {
  AVATAR = 'AVATAR',
  IMAGE = 'IMAGE'
}

@Injectable({
  providedIn: 'root'
})
export class FileService implements OnDestroy {

  private caches: Record<FileType, Map<string, { chunks: string[]; total: number; received: number; timestamp: number }>>;
  private completedFiles: Record<FileType, Map<string, { data: string; timestamp: number }>>;
  private readonly cleanupInterval: ReturnType<typeof setInterval>;
  private subscriptions: Subscription[] = [];

  public onAvatarReady?: (avatar_id: string, imgSrc: string) => void;
  public onImageReady?: (image_id: string, imgSrc: string) => void;

  constructor(private socket: SocketService) {
    this.caches = {
      [FileType.AVATAR]: new Map(),
      [FileType.IMAGE]: new Map()
    };

    this.completedFiles = {
      [FileType.AVATAR]: new Map(),
      [FileType.IMAGE]: new Map()
    };

    // 定期清理超时数据
    this.cleanupInterval = setInterval(() => this.cleanupOldEntries(), 30000);

    // 订阅头像数据
    this.subscriptions.push(
      this.socket.getMessageSubject("user", "get_user_avatars").subscribe(
        (message) => this.receiveChunk(message["avatar_id"], FileType.AVATAR, message["index"], message["chunk"], message["total"])
      )
    );

    // 订阅图片数据（如果未来扩展）
    this.subscriptions.push(
      this.socket.getMessageSubject("file", "get_image").subscribe(
        (message) => this.receiveChunk(message["image_id"], FileType.IMAGE, message["index"], message["chunk"], message["total"])
      )
    );
  }

  private receiveChunk(id: string, type: FileType, index: number, chunk: string, total: number) {
    if (!this.caches[type]) return;

    const cache = this.caches[type];

    if (!cache.has(id)) {
      cache.set(id, { chunks: Array.from({ length: total }, () => ""), total, received: 0, timestamp: Date.now() });
    }

    const fileEntry = cache.get(id)!;
    fileEntry.chunks[index] = chunk;
    fileEntry.received++;
    fileEntry.timestamp = Date.now();

    // 当所有分片接收完毕，进行重建
    if (fileEntry.received === fileEntry.total) {
      this.reconstructFile(id, type);
    }
  }

  private reconstructFile(id: string, type: FileType) {
    const cache = this.caches[type];
    if (!cache.has(id)) return;

    const fileEntry = cache.get(id)!;
    const fullBase64 = fileEntry.chunks.join("");

    // 拼接 MIME 头部，方便前端 img 直接使用
    const base64Src = `data:image/png;base64,${fullBase64}`;

    // 存入完整图片信息
    this.completedFiles[type].set(id, { data: base64Src, timestamp: Date.now() });

    // 触发回调
    if (type === FileType.AVATAR) {
      this.onAvatarReady?.(id, base64Src);
    } else if (type === FileType.IMAGE) {
      this.onImageReady?.(id, base64Src);
    }

    cache.delete(id);
  }

  public getCompletedFile(id: string, type: FileType): string | null {
    return this.completedFiles[type].get(id)?.data ?? null;
  }

  private cleanupOldEntries() {
    const now = Date.now();

    // 清理分片缓存
    Object.values(this.caches).forEach((cache) => {
      for (const [id, entry] of cache.entries()) {
        if (now - entry.timestamp > 60000) {
          cache.delete(id);
          console.warn(`File ${id} discarded due to timeout.`);
        }
      }
    });

    // 清理完整文件缓存
    Object.values(this.completedFiles).forEach((cache) => {
      for (const [id, entry] of cache.entries()) {
        if (now - entry.timestamp > 300000) { // 5分钟
          cache.delete(id);
          console.warn(`Completed file ${id} removed from cache due to timeout.`);
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    clearInterval(this.cleanupInterval);
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject } from "rxjs";
import { SocketService } from "./socket.service";

export enum FileType {
  AVATAR = 'AVATAR',
  IMAGE = 'IMAGE'
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
  url?: string; // 存储创建的对象URL
}

@Injectable({
  providedIn: 'root'
})
export class FileService implements OnDestroy {
  private caches: Record<FileType, Map<string, FileEntry>>;
  public completedFiles: Record<FileType, Record<string, CompletedFile>>;

  // 用于通知文件状态变化的主题
  private fileStatusSubjects: Record<FileType, Record<string, BehaviorSubject<string>>> = {
    [FileType.AVATAR]: {},
    [FileType.IMAGE]: {}
  };

  private readonly cleanupInterval: ReturnType<typeof setInterval>;
  private subscriptions: Subscription[] = [];

  constructor(private socket: SocketService) {
    this.caches = {
      [FileType.AVATAR]: new Map(),
      [FileType.IMAGE]: new Map()
    };

    this.completedFiles = {
      [FileType.AVATAR]: {},
      [FileType.IMAGE]: {}
    };

    // 每 30 秒清理一次旧数据
    this.cleanupInterval = setInterval(() => this.cleanupOldEntries(), 30000);

    // 订阅头像数据
    this.subscriptions.push(
      this.socket.getMessageSubject("user", "get_user_avatars").subscribe(
        (message) => {
          this.receiveChunk(
            message["id"],
            FileType.AVATAR,
            message["index"],
            message["chunk"],
            message["total"]
          );
        }
      )
    );

    // 订阅图片数据
    this.subscriptions.push(
      this.socket.getMessageSubject("file", "get_image").subscribe(
        (message) => {
          this.receiveChunk(
            message["image_id"],
            FileType.IMAGE,
            message["index"],
            message["chunk"],
            message["total"]
          );
        }
      )
    );
  }

  /** 接收并处理文件分片 */
  private receiveChunk(id: string, type: FileType, index: number, chunk: string, total: number) {
    const cache = this.caches[type];
    if (!cache.has(id)) {
      if (total === undefined) {
        console.error(`[${type}:${id}] 收到非首分片但缓存未初始化`);
        return; // 丢弃或暂存分片
      }
      cache.set(id, {
        chunks: Array(total).fill(null),
        total,
        received: 0,
        timestamp: Date.now()
      });
    }
    const fileEntry = cache.get(id)!;

    try {
      // 解码 Base64 并转换为 Uint8Array
      const decodedString = atob(chunk);
      const decodedChunk = new Uint8Array(decodedString.length);
      for (let i = 0; i < decodedString.length; i++) {
        decodedChunk[i] = decodedString.charCodeAt(i);
      }
      console.log(`[${type}:${id}] index: ${index}: ${decodedChunk.length}`);
      fileEntry.chunks[index] = decodedChunk;
    } catch (error) {
      console.error(`[${type}:${id}] 分片 ${index} 的 Base64 解码失败`, error);
      return;
    }

    fileEntry.received++;
    fileEntry.timestamp = Date.now();

    // 如果所有分片都已接收，则重建文件
    if (fileEntry.received === fileEntry.total) {
      console.log(`[${type}:${id}] 全部 ${fileEntry.total} 个分片已接收，开始合并...`);
      this.reconstructFile(id, type);
    }
  }

  /** 合并分片并存储二进制数据 */
  private reconstructFile(id: string, type: FileType) {
    const cache = this.caches[type];
    if (!cache.has(id)) return;

    const fileEntry = cache.get(id)!;

    // 检查是否有缺失的分片
    if (fileEntry.chunks.some(chunk => chunk === null)) {
      console.error(`[${type}:${id}] 检测到缺失的分片`);
      cache.delete(id);
      return;
    }

    try {
      // 计算总长度
      const totalLength = fileEntry.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const completeData = new Uint8Array(totalLength);
      let offset = 0;

      // 合并所有分片
      for (const chunk of fileEntry.chunks) {
        completeData.set(chunk, offset);
        offset += chunk.length;
      }

      // 存储完整的二进制数据
      this.completedFiles[type][id] = { data: completeData, timestamp: Date.now() };
      console.log(`[${type}:${id}] 文件合并成功，数据长度: ${completeData.length}`);

      // 创建URL并更新
      this.createFileUrl(type, id);

      // 清理缓存
      cache.delete(id);
    } catch (error) {
      console.error(`[${type}:${id}] 文件合并失败`, error);
      cache.delete(id);
    }
  }

  /** 创建文件URL（使用 Blob 而不是 data URI） */
  private createFileUrl(type: FileType, id: string) {
    const file = this.completedFiles[type][id];
    if (!file || !file.data) return;

    // 创建 Blob 对象
    const blob = new Blob([file.data]);
    // this.downloadBlob(blob, 'debug-user-avatar.png');

    // 生成 Blob URL
    file.url = URL.createObjectURL(blob);

    // 通知订阅者 URL 已更新
    if (this.fileStatusSubjects[type][id]) {
      this.fileStatusSubjects[type][id].next(file.url);
    }
  }

  downloadBlob(blob: Blob, filename: string): void {
    try {
      // 创建 Blob URL
      const url = URL.createObjectURL(blob);

      // 创建临时下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;  // 设置下载文件的文件名

      // 触发点击事件下载文件
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理 URL 对象
      URL.revokeObjectURL(url);
      console.log('下载开始');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }


  /** 清理超时数据 */
  private cleanupOldEntries() {
    const now = Date.now();

    // 清理未完成的分片（超时 60 秒）
    Object.values(this.caches).forEach((cache) => {
      for (const [id, entry] of cache.entries()) {
        if (now - entry.timestamp > 60000) {
          cache.delete(id);
          console.warn(`文件 ${id} 因超时未完成分片而被丢弃。`);
        }
      }
    });

    // // 清理已完成的文件（超时 5 分钟）
    // Object.keys(this.completedFiles).forEach((typeKey) => {
    //   const type = typeKey as FileType;
    //   const files = this.completedFiles[type];
    //   for (const id in files) {
    //     if (now - files[id].timestamp > 300000) {
    //       // 释放创建的URL
    //       if (files[id].url) {
    //         // URL.revokeObjectURL(files[id].url);
    //       }
    //
    //       // 删除文件数据
    //       delete files[id];
    //
    //       // 清理订阅主题
    //       if (this.fileStatusSubjects[type][id]) {
    //         this.fileStatusSubjects[type][id].complete();
    //         delete this.fileStatusSubjects[type][id];
    //       }
    //
    //       console.warn(`已完成文件 ${id} 因超时而被移除。`);
    //     }
    //   }
    // });
  }

  public getFileData(type: FileType, id: string): Uint8Array | undefined {
    const file = this.completedFiles[type][id];
    return file ? file.data : undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    clearInterval(this.cleanupInterval);

    // 释放所有URL资源
    Object.keys(this.completedFiles).forEach((typeKey) => {
      const type = typeKey as FileType;
      Object.values(this.completedFiles[type]).forEach(file => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
    });

    // 完成所有主题
    Object.keys(this.fileStatusSubjects).forEach((typeKey) => {
      const type = typeKey as FileType;
      Object.values(this.fileStatusSubjects[type]).forEach(subject => {
        subject.complete();
      });
    });
  }
}

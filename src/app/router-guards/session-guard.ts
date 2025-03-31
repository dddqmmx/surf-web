import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { Route, CanActivateFn } from '@angular/router';

// 使用函数化的方式定义 CanActivateFn
export const mainInitializedGuard: CanActivateFn = () => {
  const socket = inject(SocketService); // 使用 `inject` 获取服务实例
  const router = inject(Router); // 使用 `inject` 获取路由实例
  if (socket.isConnected()) {
    return true;
  } else {
    return false;
  }
};

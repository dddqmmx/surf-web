import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {CommonDataService} from '../services/common-data.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const commonDataService = inject(CommonDataService);

  if (!commonDataService.clientUserId) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

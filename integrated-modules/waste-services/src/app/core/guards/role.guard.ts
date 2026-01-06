import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.currentUserValue;

    if (!currentUser) {
      router.navigate(['/login']);
      return false;
    }

    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    // Redirect to appropriate dashboard
    if (currentUser.role === UserRole.ADMIN) {
      router.navigate(['/admin/dashboard']);
    } else {
      router.navigate(['/user/dashboard']);
    }
    
    return false;
  };
};

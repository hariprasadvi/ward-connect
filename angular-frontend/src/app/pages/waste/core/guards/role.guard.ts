import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser: any = authService.currentUserValue;

    if (!currentUser) {
      router.navigate(['/login']);
      return false;
    }

    const hasPermission = allowedRoles.some(role => authService.hasRole(role));

    if (hasPermission) {
      return true;
    }

    // Redirect to appropriate dashboard
    if (authService.hasRole(UserRole.ADMIN)) {
      router.navigate(['/waste/admin/dashboard']);
    } else {
      router.navigate(['/waste/user/dashboard']);
    }
    
    return false;
  };
};





import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService as MainAuthService } from '../../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private mainAuthService = inject(MainAuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role']; // 'member' or 'admin'
    const mainUser = this.mainAuthService.getCurrentUser();

    if (!mainUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // Map main app roles to expected module roles
    let userModuleRole: string | null = null;
    if (mainUser.role === 'Kudumbashree Member') {
      userModuleRole = 'member';
    } else if (mainUser.role === 'Kudumbashree Admin') {
      userModuleRole = 'admin';
    }

    // Check if user has Kudumbashree access
    if (!userModuleRole) {
      // User doesn't have Kudumbashree role
      alert('Access denied. This module is only for Kudumbashree members and admins.');
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Check if user has the right role for this route
    if (userModuleRole === expectedRole) {
      return true;
    } else {
      // Redirect to appropriate dashboard based on user's role
      if (userModuleRole === 'admin') {
        this.router.navigate(['/kudumbashree/admin/dashboard']);
      } else {
        this.router.navigate(['/kudumbashree/member/dashboard']);
      }
      return false;
    }
  }
}
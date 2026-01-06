import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService as MainAuthService } from '../../../services/auth.service';
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private mainAuthService = inject(MainAuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
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

    // Check approval status for members
    // admin usually auto-approved or handled differently, but let's check field if present
    const isApproved = mainUser.is_approved !== undefined ? mainUser.is_approved : true;
    
    // If pending approval, only allow access to pending page
    // Note: We need to register the pending page route first!
    // But since this guard is on Protected routes, we redirect out.
    // Wait, the pending page should probably NOT have this specific role guard or handle it.
    // Let's assume pending page is accessible with just AuthGuard or handled by flow.
    
    // Actually simpler: if not approved, Redirect to pending page.
    if (userModuleRole === 'member' && !isApproved) {
        // If they are already trying to go to pending page, allow it (how to check?)
        // The pending page needs to be added to routes.
        // Assuming path is 'pending-approval'
        
         if (state.url.includes('pending-approval')) {
             return true;
         }
         this.router.navigate(['/kudumbashree/pending-approval']);
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
        // If member and approved
        if (isApproved) {
             this.router.navigate(['/kudumbashree/member/dashboard']);
        } else {
             this.router.navigate(['/kudumbashree/pending-approval']);
        }
      }
      return false;
    }
  }
}

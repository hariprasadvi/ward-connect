import { Injectable, inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService as MainAuthService } from '../../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private mainAuthService = inject(MainAuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const user = this.mainAuthService.getCurrentUser();
    
    if (user && (user.role === 'Kudumbashree Member' || user.role === 'Kudumbashree Admin')) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
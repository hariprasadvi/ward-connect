import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService as MainAuthService } from '../../../services/auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  phone?: string;
  communityUnit?: string;
  joinDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private mainAuthService = inject(MainAuthService);
  private currentUser = signal<User | null>(null);

  user = this.currentUser.asReadonly();
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isMember = computed(() => this.currentUser()?.role === 'member');
  isLoggedIn = computed(() => !!this.currentUser());

  constructor() {
    this.initializeAuth();
    
    // Subscribe to main auth changes
    this.mainAuthService.user$.subscribe(mainUser => {
      if (mainUser) {
        this.syncFromMainAuth(mainUser);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  private initializeAuth() {
    const mainUser = this.mainAuthService.getCurrentUser();
    if (mainUser) {
      this.syncFromMainAuth(mainUser);
    }
  }

  private syncFromMainAuth(mainUser: any) {
    // Map main app roles to Kudumbashree roles
    let kudumbashreeRole: 'member' | 'admin' | null = null;
    
    if (mainUser.role === 'Kudumbashree Member') {
      kudumbashreeRole = 'member';
    } else if (mainUser.role === 'Kudumbashree Admin') {
      kudumbashreeRole = 'admin';
    }

    if (kudumbashreeRole) {
      const kudumbashreeUser: User = {
        id: mainUser.id?.toString() || '1',
        name: mainUser.full_name || mainUser.name || 'User',
        email: mainUser.email || '',
        role: kudumbashreeRole,
        phone: mainUser.mobile_number || mainUser.phone,
        communityUnit: mainUser.ward_number || 'Default Unit'
      };
      this.currentUser.set(kudumbashreeUser);
    } else {
      this.currentUser.set(null);
    }
  }

  logout() {
    // Use main auth service logout which handles everything
    this.mainAuthService.logout();
  }

  getToken(): string | null {
    return this.mainAuthService.getToken();
  }
}

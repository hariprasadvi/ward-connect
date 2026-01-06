import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService as MainAuthService } from '../../../../services/auth.service';
import { User, LoginCredentials, RegisterData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private mainAuth: MainAuthService) {}

  public get currentUser(): Observable<any | null> {
    return this.mainAuth.user$;
  }

  public get currentUserValue(): any | null {
    return this.mainAuth.currentUserValue;
  }

  login(credentials: LoginCredentials): Observable<any> {
    // Map email/password to mobile_number/password if needed, 
    // but here we just delegate to the common login
    return this.mainAuth.login(credentials);
  }

  register(data: RegisterData): Observable<any> {
    return this.mainAuth.signup(data);
  }

  logout(): void {
    this.mainAuth.logout();
  }

  isLoggedIn(): boolean {
    return this.mainAuth.isLoggedIn();
  }

  hasRole(role: any): boolean {
    return this.mainAuth.hasRole(role);
  }

  isAdmin(): boolean {
    return this.mainAuth.isAdmin();
  }

  isUser(): boolean {
    return this.mainAuth.isUser();
  }
}





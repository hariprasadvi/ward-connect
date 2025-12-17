import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService as MainAuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-kudumbashree-entry',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div class="text-center">
        <div class="inline-block p-4 rounded-full bg-white shadow-xl shadow-pink-100 mb-6">
          <svg class="w-16 h-16 text-pink-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Kudumbashree</h2>
        <p class="text-gray-600">{{ message }}</p>
      </div>
    </div>
  `
})
export class KudumbashreeEntryComponent implements OnInit {
  private mainAuthService = inject(MainAuthService);
  private router = inject(Router);
  
  message = 'Redirecting...';

  ngOnInit() {
    this.checkAccessAndRedirect();
  }

  private checkAccessAndRedirect() {
    const user = this.mainAuthService.getCurrentUser();
    
    if (!user) {
      this.message = 'Please log in to access Kudumbashree services.';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
      return;
    }

    const role = user.role;

    // Route based on user role
    if (role === 'Kudumbashree Member') {
      this.message = 'Loading member dashboard...';
      this.router.navigate(['/kudumbashree/member/dashboard']);
    } else if (role === 'Kudumbashree Admin') {
      this.message = 'Loading admin dashboard...';
      this.router.navigate(['/kudumbashree/admin/dashboard']);
    } else {
      this.message = 'Access denied. This module is only for Kudumbashree members and admins.';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    }
  }
}

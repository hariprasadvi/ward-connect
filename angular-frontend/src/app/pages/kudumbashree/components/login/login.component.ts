import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <mat-card class="max-w-md w-full p-8 text-center">
        <mat-icon class="text-6xl text-pink-600 mb-4">info</mat-icon>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Kudumbashree Login</h1>
        <p class="text-gray-600 mb-6">
          Please use the main WardConnect login page to access Kudumbashree services.
        </p>
        <button mat-raised-button color="primary" (click)="goToMainLogin()" class="w-full">
          Go to Main Login
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    // Auto-redirect to main login after 3 seconds
    setTimeout(() => {
      this.goToMainLogin();
    }, 3000);
  }

  goToMainLogin() {
    this.router.navigate(['/login']);
  }
}

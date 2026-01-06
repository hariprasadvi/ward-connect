import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="pending-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Account Pending Approval</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Hello, {{ user()?.name }}!</p>
          <p>Your Kudumbashree Member account is currently pending approval by the Administrator.</p>
          <p>Please contact your unit administrator or wait for approval.</p>
          <p>Phone: {{ user()?.phone }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="logout()">Logout</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .pending-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80vh;
      padding: 20px;
    }
    mat-card {
      max-width: 500px;
      text-align: center;
    }
    mat-card-content {
      margin: 20px 0;
      line-height: 1.6;
    }
  `]
})
export class PendingApprovalComponent {
  authService = inject(AuthService);
  router = inject(Router);
  user = this.authService.user;

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

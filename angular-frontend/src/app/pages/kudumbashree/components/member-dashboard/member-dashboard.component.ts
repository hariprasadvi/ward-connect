// member-dashboard.component.ts
import { Component, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService, User } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { DashboardService } from '../../services/dashboard.service';
import { MeetingStatus } from '../../models/meeting';

interface DashboardStat {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  route?: string;
}

interface RecentActivity {
  type: string;
  description: string;
  date: Date;
  amount?: number;
  status?: string;
}

import { LoanService, Loan } from '../../services/loan.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PayLoanDialogComponent } from '../pay-loan-dialog/pay-loan-dialog.component';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './member-dashboard.component.html',
  styleUrl: './member-dashboard.component.scss'
})
export class MemberDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private dashboardService = inject(DashboardService);
  private loanService = inject(LoanService);
  private dialog = inject(MatDialog);

  translations = this.translationService.translations$;
  user = this.authService.user;
  currentLanguage = this.translationService.getCurrentLanguage();

  stats: DashboardStat[] = [];
  recentActivities: RecentActivity[] = [];
  scheduledMeetings: any[] = [];
  activeLoans: Loan[] = []; // New property for active loans
  isLoading = true;
  // translations/user/etc already injected

  notifications: any[] = [];

  ngOnInit() {
    this.loadDashboardData();
    this.loadLoans();
  }

  loadDashboardData() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.dashboardService.getMemberDashboard(userId).subscribe({
      next: (data) => {
        const statsData = data.stats;
        this.notifications = (statsData as any).notifications || [];

        this.stats = [
          {
            title: this.translations().ACTIVE_LOANS || 'Active Loans', // Fallback if translation missing
            value: statsData.activeLoans || 0,
            icon: 'credit_score',
            color: '#1976d2',
            route: '/kudumbashree/loans'
          },
          {
            title: this.translations().PENDING,
            value: '₹' + (statsData.pendingAmount || 0),
            icon: 'pending_actions',
            color: '#f57c00',
            route: '/kudumbashree/payments'
          },
          {
            title: 'Pay Loan',
            value: 'Pay Now',
            icon: 'payment',
            color: '#d32f2f',
            route: '/kudumbashree/loans'
          }
        ];

        if (statsData.recentActivities) {
          this.recentActivities = statsData.recentActivities.map((updatedActivity: any) => ({
            type: updatedActivity.type,
            description: updatedActivity.description || updatedActivity.title,
            date: new Date(updatedActivity.date),
            amount: 0, // Backend needs to send this if needed
            status: updatedActivity.status
          }));
        } else {
          // Fallback if no activities sent
          this.recentActivities = [];
        }

        // Fetch Scheduled Meetings
        this.apiService.getMeetings().subscribe({
          next: (meetings) => {
            console.log('Fetched meetings:', meetings);
            const attendedIds = (statsData as any).attendedMeetingIds || [];
            // Filter out meetings that are scheduled AND already attended by the user
            this.scheduledMeetings = meetings.filter(m =>
              m.status === MeetingStatus.SCHEDULED && !attendedIds.includes(Number(m.id))
            );
          },
          error: (err) => console.error('Error fetching meetings:', err)
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading member dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  getQuickActions() {
    return [
      {
        title: 'Meeting Minutes',
        description: 'Auto-convert meeting speech to text',
        icon: 'record_voice_over',
        route: '/kudumbashree/meeting-minutes',
        color: '#d32f2f'
      },
      {
        title: 'Mark Attendance',
        description: 'Mark your attendance for current meeting',
        icon: 'fingerprint',
        route: '/kudumbashree/attendance',
        color: '#1976d2'
      },
      {
        title: 'Apply for Loan',
        description: 'Apply for a new community loan',
        icon: 'account_balance',
        route: '/kudumbashree/loans', // Changed from action to route
        queryParams: { tab: 'new' }, // Pass query param to open new application tab
        color: '#388e3c'
      },
      {
        title: 'My Profile',
        description: 'View and update your profile',
        icon: 'person',
        route: '/kudumbashree/profile',
        color: '#7b1fa2'
      },
      {
        title: 'Payment History',
        description: 'View your payment records',
        icon: 'receipt',
        route: '/kudumbashree/payments',
        color: '#f57c00'
      }
    ];
  }

  getActivityColor(type: string): 'primary' | 'accent' | 'warn' {
    const colors: { [key: string]: 'primary' | 'accent' | 'warn' } = {
      attendance: 'primary',
      loan: 'accent',
      meeting: 'warn'
    };
    return colors[type] || 'primary';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      attendance: 'fingerprint',
      loan: 'account_balance',
      meeting: 'event'
    };
    return icons[type] || 'info';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      completed: '#388e3c',
      pending: '#f57c00',
      failed: '#d32f2f'
    };
    return colors[status] || '#666';
  }

  getStatusTranslation(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'Completed',
      'pending': 'Pending'
    };

    return statusMap[status] || status;
  }

  getMeetingTitle(isMalayalam: boolean): string {
    return 'Monthly Savings Meeting';
  }

  getMeetingLocation(isMalayalam: boolean): string {
    return 'Community Hall';
  }

  getLoanTitle(isMalayalam: boolean): string {
    return 'Loan Committee Review';
  }

  getLoanLocation(isMalayalam: boolean): string {
    return 'Kudumbashree Office';
  }

  loadLoans() {
    const userId = this.user()?.id;
    if (userId) {
      this.loanService.getLoans(Number(userId)).subscribe({
        next: (loans) => {
          this.activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Pending');
        },
        error: (err) => console.error('Error loading loans:', err)
      });
    }
  }


  payLoan(loan: Loan) {
    const dialogRef = this.dialog.open(PayLoanDialogComponent, {
      width: '400px',
      data: { loan }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadLoans();
        this.loadDashboardData();
      }
    });
  }

  deleteMeeting(meetingId: string) {
    if (confirm('Are you sure you want to delete this meeting?')) {
      this.apiService.deleteMeeting(meetingId).subscribe({
        next: () => {
          console.log('Meeting deleted successfully');
          this.loadDashboardData(); // Refresh list
        },
        error: (err) => {
          console.error('Error deleting meeting:', err);
          alert('Failed to delete meeting: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}

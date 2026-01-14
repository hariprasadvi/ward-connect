// member-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
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
    MatProgressSpinnerModule
  ],
  templateUrl: './member-dashboard.component.html',
  styleUrl: './member-dashboard.component.scss'
})
export class MemberDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);

  translations = this.translationService.translations$;
  user = this.authService.user;
  currentLanguage = this.translationService.getCurrentLanguage();

  stats: DashboardStat[] = [];
  recentActivities: RecentActivity[] = [];
  scheduledMeetings: any[] = [];
  isLoading = true;

  private dashboardService = inject(DashboardService);
  // translations/user/etc already injected

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.dashboardService.getMemberDashboard(userId).subscribe({
      next: (data) => {
        const statsData = data.stats;
        this.stats = [
          {
            title: this.translations().TOTAL_LOANS,
            value: statsData.loansTaken,
            icon: 'event_available',
            color: '#1976d2',
            route: '/kudumbashree/loans'
          },
          {
            title: this.translations().LOAN_AMOUNT,
            value: '₹' + (statsData.totalLoanAmount || 0),
            icon: 'account_balance',
            color: '#388e3c',
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
            title: this.translations().ATTENDANCE_RATE,
            value: (statsData.attendanceRate || 0) + '%',
            icon: 'star',
            color: '#ffa000'
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
        route: '/kudumbashree/loans',
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

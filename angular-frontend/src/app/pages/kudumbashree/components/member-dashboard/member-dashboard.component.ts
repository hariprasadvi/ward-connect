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
  isLoading = true;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Simulate API calls
    setTimeout(() => {
      this.stats = [
        {
          title: this.translations().TOTAL_LOANS,
          value: 12,
          icon: 'event_available',
          color: '#1976d2',
          route: '/kudumbashree/attendance'
        },
        {
          title: this.translations().LOAN_AMOUNT,
          value: '₹15,000',
          icon: 'account_balance',
          color: '#388e3c',
          route: '/kudumbashree/loans'
        },
        {
          title: this.translations().PENDING,
          value: '₹500',
          icon: 'pending_actions',
          color: '#f57c00',
          route: '/kudumbashree/payments'
        },
        {
          title: this.translations().ATTENDANCE_RATE,
          value: '4.8/5',
          icon: 'star',
          color: '#ffa000'
        }
      ];

      this.recentActivities = [
        {
          type: 'attendance',
          description: this.currentLanguage === 'ml' ? 
            'മാസിക കമ്മ്യൂണിറ്റി മീറ്റിംഗ്' : 'Monthly Community Meeting',
          date: new Date('2024-01-15'),
          amount: 50,
          status: 'completed'
        },
        {
          type: 'loan',
          description: this.currentLanguage === 'ml' ? 
            'ലോൺ EMI പേയ്മെന്റ്' : 'Loan EMI Payment',
          date: new Date('2024-01-10'),
          amount: 1500,
          status: 'completed'
        },
        {
          type: 'meeting',
          description: this.currentLanguage === 'ml' ? 
            'സ്പെഷ്യൽ ജനറൽ മീറ്റിംഗ്' : 'Special General Meeting',
          date: new Date('2024-01-05'),
          amount: 50,
          status: 'completed'
        },
        {
          type: 'loan',
          description: this.currentLanguage === 'ml' ? 
            'ലോൺ അപേക്ഷ - ചെറുകിട ബിസിനസ്' : 'Loan Application - Small Business',
          date: new Date('2024-01-18'),
          amount: 20000,
          status: 'pending'
        }
      ];

      this.isLoading = false;
    }, 1000);
  }

  getQuickActions() {
    const isMalayalam = this.currentLanguage === 'ml';
    
    return [
      {
        title: isMalayalam ? 'ഹാജരാകൽ രേഖപ്പെടുത്തുക' : 'Mark Attendance',
        description: isMalayalam ? 'നിലവിലെ മീറ്റിംഗിനായി നിങ്ങളുടെ ഹാജരാകൽ രേഖപ്പെടുത്തുക' : 'Mark your attendance for current meeting',
        icon: 'fingerprint',
        route: '/kudumbashree/attendance',
        color: '#1976d2'
      },
      {
        title: isMalayalam ? 'ലോണിന് അപേക്ഷിക്കുക' : 'Apply for Loan',
        description: isMalayalam ? 'പുതിയ കമ്മ്യൂണിറ്റി ലോണിന് അപേക്ഷിക്കുക' : 'Apply for a new community loan',
        icon: 'account_balance',
        route: '/kudumbashree/loans',
        color: '#388e3c'
      },
      {
        title: isMalayalam ? 'എന്റെ പ്രൊഫൈൽ' : 'My Profile',
        description: isMalayalam ? 'നിങ്ങളുടെ പ്രൊഫൈൽ കാണുകയും അപ്ഡേറ്റ് ചെയ്യുകയും ചെയ്യുക' : 'View and update your profile',
        icon: 'person',
        route: '/kudumbashree/profile',
        color: '#7b1fa2'
      },
      {
        title: isMalayalam ? 'പേയ്മെന്റ് ചരിത്രം' : 'Payment History',
        description: isMalayalam ? 'നിങ്ങളുടെ പേയ്മെന്റ് റെക്കോർഡുകൾ കാണുക' : 'View your payment records',
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
    const isMalayalam = this.currentLanguage === 'ml';
    
    const statusMap: { [key: string]: string } = {
      'completed': isMalayalam ? 'പൂർത്തിയായി' : 'Completed',
      'pending': isMalayalam ? 'തീർച്ചപ്പെടുത്താത്ത' : 'Pending'
    };
    
    return statusMap[status] || status;
  }

  getMeetingTitle(isMalayalam: boolean): string {
    return isMalayalam ? 'മാസിക സേവിംഗ്സ് മീറ്റിംഗ്' : 'Monthly Savings Meeting';
  }

  getMeetingLocation(isMalayalam: boolean): string {
    return isMalayalam ? 'കമ്മ്യൂണിറ്റി ഹാൾ' : 'Community Hall';
  }

  getLoanTitle(isMalayalam: boolean): string {
    return isMalayalam ? 'ലോൺ കമ്മിറ്റി റിവ്യൂ' : 'Loan Committee Review';
  }

  getLoanLocation(isMalayalam: boolean): string {
    return isMalayalam ? 'കുടുംബശ്രീ ഓഫീസ്' : 'Kudumbashree Office';
  }
}
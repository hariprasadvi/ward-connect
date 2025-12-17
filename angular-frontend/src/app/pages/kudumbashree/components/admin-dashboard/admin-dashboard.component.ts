// admin-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService, User } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';

interface AdminStat {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  communityUnit: string;
  joinDate: Date;
  status: string;
}

interface Loan {
  id: string;
  loanNumber: string;
  userId: string;
  userName: string;
  amount: number;
  purpose: string;
  status: string;
  appliedDate: Date;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);

  translations = this.translationService.translations$;
  user = this.authService.user;

  stats: AdminStat[] = [];
  recentMembers: Member[] = [];
  pendingLoans: Loan[] = [];
  displayedColumns: string[] = ['name', 'communityUnit', 'joinDate', 'status'];
  isLoading = true;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Simulate API calls
    setTimeout(() => {
      this.stats = [
        {
          title: this.translations().TOTAL_MEMBERS,
          value: 156,
          icon: 'people',
          color: '#1976d2',
          change: '+12%'
        },
        {
          title: this.translations().ACTIVE_LOANS,
          value: '₹2,45,000',
          icon: 'account_balance',
          color: '#388e3c',
          change: '+8%'
        },
        {
          title: this.translations().TOTAL_LOAN_AMOUNT,
          value: '₹45,200',
          icon: 'payments',
          color: '#f57c00',
          change: '+15%'
        },
        {
          title: this.translations().PENDING_APPROVAL,
          value: 8,
          icon: 'pending_actions',
          color: '#d32f2f',
          change: '-3%'
        }
      ];

      this.recentMembers = [
        {
          id: '1',
          name: 'Rani S',
          email: 'rani@community.com',
          communityUnit: 'Unit 5A',
          joinDate: new Date('2024-01-15'),
          status: 'Active'
        },
        {
          id: '2',
          name: 'Lakshmi M',
          email: 'lakshmi@community.com',
          communityUnit: 'Unit 3B',
          joinDate: new Date('2024-01-10'),
          status: 'Active'
        },
        {
          id: '3',
          name: 'Geetha P',
          email: 'geetha@community.com',
          communityUnit: 'Unit 7C',
          joinDate: new Date('2024-01-08'),
          status: 'Pending'
        }
      ];

      this.pendingLoans = [
        {
          id: '1',
          loanNumber: 'LN004',
          userId: 'user4',
          userName: 'Sunitha R',
          amount: 20000,
          purpose: 'Small Business',
          status: 'pending',
          appliedDate: new Date('2024-01-18')
        },
        {
          id: '2',
          loanNumber: 'LN005',
          userId: 'user5',
          userName: 'Meena K',
          amount: 15000,
          purpose: 'Education',
          status: 'pending',
          appliedDate: new Date('2024-01-17')
        }
      ];

      this.isLoading = false;
    }, 1000);
  }

  getAdminActions() {
    const isMalayalam = this.translationService.getCurrentLanguage() === 'ml';
    
    return [
      {
        title: isMalayalam ? 'അംഗങ്ങളെ നിയന്ത്രിക്കുക' : 'Manage Members',
        description: isMalayalam ? 'എല്ലാ കമ്മ്യൂണിറ്റി അംഗങ്ങളും കാണുകയും നിയന്ത്രിക്കുകയും ചെയ്യുക' : 'View and manage all community members',
        icon: 'group',
        route: '/kudumbashree/admin/members',
        color: '#1976d2'
      },
      {
        title: isMalayalam ? 'ലോൺ മാനേജ്മെന്റ്' : 'Loan Management',
        description: isMalayalam ? 'ലോൺ അപേക്ഷകൾ അനുവദിക്കുകയും നിയന്ത്രിക്കുകയും ചെയ്യുക' : 'Approve and manage loan applications',
        icon: 'account_balance',
        route: '/kudumbashree/admin/loans',
        color: '#388e3c'
      },
      {
        title: isMalayalam ? 'മീറ്റിംഗ് ഷെഡ്യൂൾ ചെയ്യുക' : 'Schedule Meeting',
        description: isMalayalam ? 'പുതിയ മീറ്റിംഗുകൾ സൃഷ്ടിക്കുകയും ഷെഡ്യൂൾ ചെയ്യുകയും ചെയ്യുക' : 'Create and schedule new meetings',
        icon: 'event',
        route: '/kudumbashree/meetings',
        color: '#7b1fa2'
      },
      {
        title: isMalayalam ? 'റിപ്പോർട്ടുകൾ ജനറേറ്റ് ചെയ്യുക' : 'Generate Reports',
        description: isMalayalam ? 'ധനകാര്യവും പ്രവർത്തന റിപ്പോർട്ടുകൾ സൃഷ്ടിക്കുക' : 'Create financial and activity reports',
        icon: 'analytics',
        route: '/kudumbashree/reports',
        color: '#f57c00'
      },
      {
        title: isMalayalam ? 'മീറ്റിംഗ് മിനിറ്റുകൾ' : 'Meeting Minutes',
        description: isMalayalam ? 'മീറ്റിംഗ് മിനിറ്റുകൾ റെക്കോർഡ് ചെയ്യുകയും നിയന്ത്രിക്കുകയും ചെയ്യുക' : 'Record and manage meeting minutes',
        icon: 'record_voice_over',
        route: '/kudumbashree/meeting-minutes',
        color: '#d32f2f'
      },
      {
        title: isMalayalam ? 'സിസ്റ്റം സെറ്റിംഗുകൾ' : 'System Settings',
        description: isMalayalam ? 'സിസ്റ്റം മുൻഗണനകൾ കോൺഫിഗർ ചെയ്യുക' : 'Configure system preferences',
        icon: 'settings',
        route: '/kudumbashree/admin/settings',
        color: '#424242'
      }
    ];
  }

  getFormattedAmount(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  getStatusTranslation(status: string): string {
    const isMalayalam = this.translationService.getCurrentLanguage() === 'ml';
    
    const statusMap: { [key: string]: string } = {
      'Active': isMalayalam ? 'സജീവം' : 'Active',
      'Pending': isMalayalam ? 'തീർച്ചപ്പെടുത്താത്ത' : 'Pending',
      'pending': isMalayalam ? 'തീർച്ചപ്പെടുത്താത്ത' : 'Pending'
    };
    
    return statusMap[status] || status;
  }
}
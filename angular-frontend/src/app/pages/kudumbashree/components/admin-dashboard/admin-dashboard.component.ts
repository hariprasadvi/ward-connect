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
import { DashboardService } from '../../services/dashboard.service';

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
  is_approved: boolean;
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

  private dashboardService = inject(DashboardService);
  // translations/user/etc already injected

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.stats = [
          {
            title: this.translations().TOTAL_MEMBERS,
            value: data.totalMembers,
            icon: 'people',
            color: '#1976d2',
            change: '+0%' // Backend doesn't provide change yet
          },
          {
            title: this.translations().ACTIVE_LOANS,
            value: this.getFormattedAmount(data.totalLoanAmount),
            icon: 'account_balance',
            color: '#388e3c',
            change: '+0%'
          },
          {
            title: this.translations().TOTAL_LOAN_AMOUNT,
            value: this.getFormattedAmount(data.totalLoanAmount),
            icon: 'payments',
            color: '#f57c00',
            change: '+0%'
          },
          {
            title: this.translations().PENDING_APPROVAL,
            value: data.pendingLoans,
            icon: 'pending_actions',
            color: '#d32f2f',
            change: '0%'
          }
        ];
        
        // Load recent members if available or separate call
        // For now, we will fetch members separately or assume empty until backend supports it in dashboard
        // Actually, let's call getAllMembers if needed, but dashboard stats are primary. 
        // We will leave recentMembers empty or fetch separately if there is an endpoint.
        // memberRoutes has router.get('/members', memberController.getAllMembers);
        this.loadMembers();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  loadMembers() {
    this.dashboardService.getAllMembers().subscribe({
        next: (members) => {
            this.recentMembers = members.slice(0, 5).map((m: any) => ({
                id: m.id?.toString() || '',
                name: m.full_name || m.name,
                email: m.email,
                communityUnit: m.ward_number || m.communityUnit,
                joinDate: new Date(),
                is_approved: !!m.is_approved,
                status: m.is_approved ? 'Active' : 'Pending'
            }));
        },
        error: (err) => console.error(err)
    });
  }

  getAdminActions() {
    return [
      {
        title: 'Manage Members',
        description: 'View and manage all community members',
        icon: 'group',
        route: '/kudumbashree/admin/members',
        color: '#1976d2'
      },
      {
        title: 'Loan Management',
        description: 'Approve and manage loan applications',
        icon: 'account_balance',
        route: '/kudumbashree/admin/loans',
        color: '#388e3c'
      },
      {
        title: 'Schedule Meeting',
        description: 'Create and schedule new meetings',
        icon: 'event',
        route: '/kudumbashree/meetings',
        color: '#7b1fa2'
      },
      {
        title: 'Generate Reports',
        description: 'Create financial and activity reports',
        icon: 'analytics',
        route: '/kudumbashree/reports',
        color: '#f57c00'
      },
      {
        title: 'Meeting Minutes',
        description: 'Record and manage meeting minutes',
        icon: 'record_voice_over',
        route: '/kudumbashree/meeting-minutes',
        color: '#d32f2f'
      },
      {
        title: 'System Settings',
        description: 'Configure system preferences',
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
    const statusMap: { [key: string]: string } = {
      'Active': 'Active',
      'Pending': 'Pending',
      'pending': 'Pending'
    };
    
    return statusMap[status] || status;
  }
}

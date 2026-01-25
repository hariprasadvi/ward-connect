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
import { MatDialog } from '@angular/material/dialog';

import { AuthService, User } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { DashboardService } from '../../services/dashboard.service';
import { LoanService, Loan } from '../../services/loan.service';

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
  private dashboardService = inject(DashboardService);
  private loanService = inject(LoanService);
  private dialog = inject(MatDialog);

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
    // 1. Load Pending Loans
    this.loanService.getLoans(undefined, undefined).subscribe({
      next: (loans) => {
        this.pendingLoans = loans.filter(l => l.status === 'Pending');
        this.updatePendingStat();
      },
      error: (err) => console.error('Error loading loans', err)
    });

    // 2. Load Dashboard Stats
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.stats = [
          {
            title: this.translations().TOTAL_MEMBERS,
            value: data.totalMembers,
            icon: 'people',
            color: '#1976d2',
            change: '+0%'
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
            value: data.pendingLoans || 0,
            icon: 'pending_actions',
            color: '#d32f2f',
            change: '0%'
          }
        ];
        
        // Update pending stat if loans loaded first or now
        this.updatePendingStat();

        this.loadMembers();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  updatePendingStat() {
     // If stats initialized and pendingLoans loaded, sync them.
     if (this.stats.length > 3) {
         this.stats[3].value = this.pendingLoans.length; // Use client side count for accuracy
     }
  }

  loadMembers() {
    this.dashboardService.getAllMembers().subscribe({
        next: (members) => {
            this.recentMembers = members.slice(0, 5).map((m: any) => ({
                id: m.id?.toString() || '',
                name: m.full_name || m.name,
                email: m.email,
                communityUnit: m.ward_number || m.communityUnit,
                joinDate: new Date(), // Backend doesn't send date?
                is_approved: !!m.is_approved,
                status: m.is_approved ? 'Active' : 'Pending'
            }));
        },
        error: (err) => console.error(err)
    });
  }

  reviewLoan(loan: Loan) {
    const confirmed = confirm(`
    Review Loan Application:
    Applicant: ${loan.User?.full_name || 'Unknown'}
    Amount: ₹${loan.amount}
    Purpose: ${loan.purpose}
    
    AI Risk Assessment:
    Score: ${loan.risk_score} / 100
    Analysis: ${loan.ai_analysis}
    
    Approve this loan?
    `);

    if (confirmed) {
        this.loanService.updateLoanStatus(Number(loan.id), 'Approved', 'Approved by Admin').subscribe({
            next: () => {
                alert('Loan Approved!');
                this.loadDashboardData();
            },
            error: (err) => alert('Error approving loan: ' + (err.error?.message || err.message))
        });
    } else {
      if(confirm('Reject this loan?')) {
          this.loanService.updateLoanStatus(Number(loan.id), 'Rejected', 'Rejected by Admin').subscribe({
              next: () => {
                  alert('Loan Rejected');
                  this.loadDashboardData();
              },
              error: (err) => alert('Error rejecting loan')
          });
      }
    }
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
    return '₹' + (amount || 0).toLocaleString('en-IN');
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

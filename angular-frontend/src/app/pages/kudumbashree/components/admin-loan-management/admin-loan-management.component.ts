import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

import { TranslationService } from '../../services/translation.service';

interface Loan {
  id: string;
  loanNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  communityUnit: string;
  amount: number;
  purpose: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  appliedDate: Date;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
}

@Component({
  selector: 'app-admin-loan-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    FormsModule
  ],
  templateUrl: './admin-loan-management.component.html',
  styleUrl: './admin-loan-management.component.scss'
})
export class AdminLoanManagementComponent implements OnInit {
  private translationService = inject(TranslationService);
  private dialog = inject(MatDialog);

  translations = this.translationService.translations$;

  loans: Loan[] = [];
  filteredLoans: Loan[] = [];
  displayedColumns: string[] = ['loanNumber', 'user', 'amount', 'purpose', 'appliedDate', 'status', 'actions'];
  
  // Filter properties
  searchTerm: string = '';
  statusFilter: string = 'all';
  unitFilter: string = 'all';

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    // Simulate API call
    setTimeout(() => {
      this.loans = [
        {
          id: '1',
          loanNumber: 'LN004',
          userId: 'user4',
          userName: 'Sunitha R',
          userEmail: 'sunitha@community.com',
          userPhone: '9876543213',
          communityUnit: 'Unit 2D',
          amount: 20000,
          purpose: 'Small Business',
          description: 'Starting a small tailoring business',
          status: 'pending',
          appliedDate: new Date('2024-01-18'),
          interestRate: 8.5,
          tenureMonths: 24,
          emiAmount: 907
        },
        {
          id: '2',
          loanNumber: 'LN005',
          userId: 'user5',
          userName: 'Meena K',
          userEmail: 'meena@community.com',
          userPhone: '9876543214',
          communityUnit: 'Unit 8E',
          amount: 15000,
          purpose: 'Education',
          description: 'Children education fees',
          status: 'pending',
          appliedDate: new Date('2024-01-17'),
          interestRate: 7.5,
          tenureMonths: 18,
          emiAmount: 897
        },
        {
          id: '3',
          loanNumber: 'LN002',
          userId: 'user2',
          userName: 'Lakshmi M',
          userEmail: 'lakshmi@community.com',
          userPhone: '9876543211',
          communityUnit: 'Unit 3B',
          amount: 15000,
          purpose: 'Education',
          description: 'Daughter college fees',
          status: 'approved',
          appliedDate: new Date('2024-01-20'),
          interestRate: 7.5,
          tenureMonths: 18,
          emiAmount: 897,
          approvedBy: 'Admin',
          approvedDate: new Date('2024-01-21')
        },
        {
          id: '4',
          loanNumber: 'LN001',
          userId: 'user1',
          userName: 'Rani S',
          userEmail: 'rani@community.com',
          userPhone: '9876543210',
          communityUnit: 'Unit 5A',
          amount: 25000,
          purpose: 'Small Business',
          description: 'Grocery shop expansion',
          status: 'disbursed',
          appliedDate: new Date('2024-01-15'),
          interestRate: 8.5,
          tenureMonths: 24,
          emiAmount: 1134,
          approvedBy: 'Admin',
          approvedDate: new Date('2024-01-16')
        },
        {
          id: '5',
          loanNumber: 'LN003',
          userId: 'user3',
          userName: 'Geetha P',
          userEmail: 'geetha@community.com',
          userPhone: '9876543212',
          communityUnit: 'Unit 7C',
          amount: 50000,
          purpose: 'Housing Repair',
          description: 'House roof repair',
          status: 'rejected',
          appliedDate: new Date('2024-01-10'),
          interestRate: 9.0,
          tenureMonths: 36,
          emiAmount: 1590,
          approvedBy: 'Admin',
          approvedDate: new Date('2024-01-12'),
          rejectionReason: 'Insufficient income proof'
        }
      ];
      this.filteredLoans = [...this.loans];
    }, 1000);
  }

  applyFilters() {
    this.filteredLoans = this.loans.filter(loan => {
      const matchesSearch = loan.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          loan.loanNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          loan.purpose.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || loan.status === this.statusFilter;
      const matchesUnit = this.unitFilter === 'all' || loan.communityUnit === this.unitFilter;

      return matchesSearch && matchesStatus && matchesUnit;
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusTranslation(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'disbursed': 'Disbursed'
    };
    return statusMap[status] || status;
  }

  approveLoan(loan: Loan) {
    loan.status = 'approved';
    loan.approvedBy = 'Admin';
    loan.approvedDate = new Date();
    // In real app, call API to update loan status
  }

  rejectLoan(loan: Loan) {
    loan.status = 'rejected';
    loan.approvedBy = 'Admin';
    loan.approvedDate = new Date();
    loan.rejectionReason = 'Application does not meet criteria';
    // In real app, call API to update loan status
  }

  disburseLoan(loan: Loan) {
    loan.status = 'disbursed';
    // In real app, call API to disburse loan
  }

  viewLoanDetails(loan: Loan) {
    // Implement view details dialog
    console.log('View details for loan:', loan.loanNumber);
  }

  getFormattedAmount(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  getUniqueUnits(): string[] {
    return [...new Set(this.loans.map(loan => loan.communityUnit))];
  }

  getPendingLoansCount(): number {
    return this.loans.filter(loan => loan.status === 'pending').length;
  }

  getTotalLoanAmount(): number {
    return this.loans.reduce((sum, loan) => sum + loan.amount, 0);
  }

  getActiveLoansCount(): number {
    return this.loans.filter(loan => loan.status === 'disbursed').length;
  }
}
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
import { LoanService } from '../../services/loan.service';

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
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active';
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
  private loanService = inject(LoanService); // Inject LoanService

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
    this.loanService.getLoans().subscribe({
        next: (loans) => {
            // Map backend data to UI interface if needed, or use Loan interface directly
            // Backend Loan has User object, so we can map it
            this.loans = loans.map((l: any) => ({
                id: l.id,
                loanNumber: 'LN' + String(l.id).padStart(3, '0'), // Generate ID if missing
                userId: l.userId,
                userName: l.User?.full_name || 'Unknown',
                userEmail: l.User?.email || 'N/A',
                userPhone: l.User?.phone || 'N/A', // Assuming phone is available
                communityUnit: l.User?.ward_number || 'N/A', // Mapping ward to unit
                amount: Number(l.amount),
                purpose: l.purpose,
                description: l.description || l.purpose, // Fallback
                status: l.status.toLowerCase(),
                appliedDate: l.createdAt || new Date(),
                interestRate: 8.5, // Static for now
                tenureMonths: l.tenure_months,
                emiAmount: this.calculateEMI(l.amount, l.tenure_months),
                approvedBy: l.admin_comments || '', // construct from logs or comments
                approvedDate: l.start_date
            }));
            this.applyFilters();
        },
        error: (err) => console.error('Error loading loans', err)
    });
  }

  calculateEMI(amount: number, tenure: number): number {
    if (!amount || !tenure) return 0;
    const r = 8.5 / 12 / 100;
    return Math.round(amount * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1));
  }

  applyFilters() {
    this.filteredLoans = this.loans.filter(loan => {
      const matchesSearch = (loan.userName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          (loan.loanNumber || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          (loan.purpose || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || loan.status === this.statusFilter;
      const matchesUnit = this.unitFilter === 'all' || loan.communityUnit === this.unitFilter;

      return matchesSearch && matchesStatus && matchesUnit;
    });
  }

  getStatusClass(status: string): string {
    return `status-${(status || '').toLowerCase()}`;
  }

  getStatusTranslation(status: string): string {
    return (status || '').charAt(0).toUpperCase() + (status || '').slice(1);
  }

  approveLoan(loan: any) {
    if(confirm(`Approve loan for ${loan.userName}?`)) {
        this.loanService.updateLoanStatus(Number(loan.id), 'Approved', 'Approved via Admin Panel').subscribe({
            next: () => {
                alert('Loan Approved Successfully');
                this.loadLoans();
            },
            error: (err) => alert('Error approving loan: ' + (err.error?.message || err.message))
        });
    }
  }

  rejectLoan(loan: any) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
        this.loanService.updateLoanStatus(Number(loan.id), 'Rejected', reason).subscribe({
            next: () => {
                alert('Loan Rejected');
                this.loadLoans();
            },
            error: (err) => alert('Error rejecting loan')
        });
    }
  }

  disburseLoan(loan: any) {
     // If we have a separate disburse step, implement here. 
     // For now, Approval might auto-disburse or set to Active.
     // If stuck in 'Approved' but not 'Active', we might need a specific call.
     // Assuming 'Approved' transitions to 'Active' automatically in backend logic or separate step.
     // Re-using update status for now if needed.
     alert('Disbursement logic is handled during approval or requires backend update.');
  }

  viewLoanDetails(loan: any) {
    // Implement proper dialog or view
    alert(`
    Loan Details:
    ID: ${loan.loanNumber}
    Applicant: ${loan.userName}
    Amount: ₹${loan.amount}
    Purpose: ${loan.purpose}
    Status: ${loan.status}
    `);
  }

  getFormattedAmount(amount: number): string {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  }

  getUniqueUnits(): string[] {
    return [...new Set(this.loans.map(loan => loan.communityUnit).filter(u => u !== 'N/A'))];
  }

  getPendingLoansCount(): number {
    return this.loans.filter(loan => loan.status === 'pending').length;
  }

  getTotalLoanAmount(): number {
    return this.loans.reduce((sum, loan) => sum + loan.amount, 0);
  }

  getActiveLoansCount(): number {
    return this.loans.filter(loan => loan.status === 'active' || loan.status === 'disbursed' || loan.status === 'approved').length;
  }
}

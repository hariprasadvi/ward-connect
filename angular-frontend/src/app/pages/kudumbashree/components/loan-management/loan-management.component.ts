import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { LoanService, Loan } from '../../services/loan.service';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './loan-management.component.html',
  styleUrl: './loan-management.component.scss'
})
export class LoanManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private loanService = inject(LoanService);
  private translationService = inject(TranslationService);

  translations = this.translationService.translations$;

  loanForm: FormGroup;
  loans: Loan[] = [];
  displayedColumns: string[] = ['loanNumber', 'amount', 'purpose', 'appliedDate', 'status'];

  constructor() {
    this.loanForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1000), Validators.max(100000)]],
      purpose: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.maxLength(500)]],
      tenure: [12, [Validators.required, Validators.min(6), Validators.max(60)]]
    });
  }

  ngOnInit() {
    this.loadLoans();
  }

  applyForLoan() {
    if (this.loanForm.valid) {
        const loanData = {
            ...this.loanForm.value,
            tenure_months: this.loanForm.value.tenure 
        };

        this.loanService.applyLoan(loanData).subscribe({
            next: (res) => {
                alert('Loan application submitted successfully!');
                this.loanForm.reset({ tenure: 12 });
                this.loadLoans(); // Reload list
            },
            error: (err) => {
                console.error("Loan Application Failed:", err);
                alert('Failed to apply loan: ' + (err.error?.message || err.message));
            }
        });
    }
  }

  loadLoans() {
    this.loanService.getLoans().subscribe({
        next: (loans) => {
            this.loans = loans;
        },
        error: (err) => console.error('Error loading loans:', err)
    });
  }

  getStatusClass(status: string): string {
    return `status-${(status || '').toLowerCase()}`;
  }

  getStatusTranslation(status: string): string {
    // Basic translation or uppercase fallback
    return (status || '').toUpperCase();
  }

  calculateEMI(): number {
    const amount = this.loanForm.get('amount')?.value || 0;
    const tenure = this.loanForm.get('tenure')?.value || 12;
    const interestRate = 8.5; // Fixed interest rate for demo
    
    if (!amount || amount < 1000) return 0;
    
    const monthlyRate = interestRate / 12 / 100;
    const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    return Math.round(emi);
  }

  calculateTotalRepayment(): number {
    const tenure = this.loanForm.get('tenure')?.value || 0;
    const emi = this.calculateEMI();
    return emi * tenure;
  }

  calculateTotalInterest(): number {
    const amount = this.loanForm.get('amount')?.value || 0;
    const totalRepayment = this.calculateTotalRepayment();
    return Math.round(totalRepayment - amount);
  }

  getFormattedAmount(amount: number): string {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  }

  getApprovedCount(): number {
    return this.loans.filter(loan => loan.status === 'Approved').length;
  }

  getPendingCount(): number {
    return this.loans.filter(loan => loan.status === 'Pending').length;
  }

  getTotalLoanAmount(): number {
    return this.loans.reduce((total, loan) => total + (Number(loan.amount) || 0), 0);
  }

  clearForm() {
    this.loanForm.reset({ tenure: 12 });
  }
}

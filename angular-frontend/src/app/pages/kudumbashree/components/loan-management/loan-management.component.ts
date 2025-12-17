import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { Loan, LoanStatus } from '../../models';

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
    MatIconModule
  ],
  templateUrl: './loan-management.component.html',
  styleUrl: './loan-management.component.scss' // Fixed: changed from .css to .scss
})
export class LoanManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);

  translations = this.translationService.translations$;

  loanForm: FormGroup;
  loans: Loan[] = [];
  displayedColumns: string[] = ['loanNumber', 'amount', 'purpose', 'appliedDate', 'status'];

  // Sample data for demonstration
  private sampleLoans: Loan[] = [
    {
      id: '1',
      loanNumber: 'LN001',
      userId: 'user1',
      userName: 'Rani S',
      amount: 25000,
      purpose: 'Small Business',
      status: LoanStatus.APPROVED,
      appliedDate: new Date('2024-01-15'),
      interestRate: 8.5,
      tenureMonths: 24,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      loanNumber: 'LN002',
      userId: 'user2',
      userName: 'Lakshmi M',
      amount: 15000,
      purpose: 'Education',
      status: LoanStatus.PENDING,
      appliedDate: new Date('2024-01-20'),
      interestRate: 7.5,
      tenureMonths: 18,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      loanNumber: 'LN003',
      userId: 'user3',
      userName: 'Geetha P',
      amount: 50000,
      purpose: 'Housing Repair',
      status: LoanStatus.REJECTED,
      appliedDate: new Date('2024-01-10'),
      interestRate: 9.0,
      tenureMonths: 36,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

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
        appliedDate: new Date(),
        status: LoanStatus.PENDING
      };
      
      // For demo purposes, add to local array
      const newLoan: Loan = {
        id: Date.now().toString(),
        loanNumber: 'LN' + (this.loans.length + 1).toString().padStart(3, '0'),
        userId: 'currentUser',
        userName: 'Current User',
        amount: this.loanForm.value.amount,
        purpose: this.loanForm.value.purpose,
        description: this.loanForm.value.description,
        status: LoanStatus.PENDING,
        appliedDate: new Date(),
        interestRate: 8.5,
        tenureMonths: this.loanForm.value.tenure,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.loans.unshift(newLoan);
      this.loanForm.reset({ tenure: 12 });
      alert('Loan application submitted successfully!');
    }
  }

  loadLoans() {
    // For demo, use sample data
    this.loans = this.sampleLoans;
  }

  getStatusClass(status: LoanStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusTranslation(status: LoanStatus): string {
    const statusTranslations: { [key in LoanStatus]?: string } = {
      [LoanStatus.PENDING]: 'PENDING',
      [LoanStatus.APPROVED]: 'APPROVED',
      [LoanStatus.REJECTED]: 'REJECTED'
    };
    return statusTranslations[status] || status;
  }

  // Fixed: Add missing methods
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

  getFormattedAmount(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  getApprovedCount(): number {
    return this.loans.filter(loan => loan.status === LoanStatus.APPROVED).length;
  }

  getPendingCount(): number {
    return this.loans.filter(loan => loan.status === LoanStatus.PENDING).length;
  }

  getTotalLoanAmount(): number {
    return this.loans.reduce((total, loan) => total + loan.amount, 0);
  }

  clearForm() {
    this.loanForm.reset({ tenure: 12 });
  }
}
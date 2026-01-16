import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  type: 'attendance' | 'loan_emi' | 'loan_application' | 'savings';
  method: 'upi' | 'cash' | 'bank_transfer';
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  description: string;
  meetingTitle?: string;
  loanNumber?: string;
}

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  
  user = this.authService.user;
  isLoading = false;

  translations = this.translationService.translations$;

  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  displayedColumns: string[] = ['transactionId', 'date', 'type', 'amount', 'method', 'status', 'actions'];
  
  // Statistics
  totalPaid: number = 0;
  pendingPayments: number = 0;
  attendancePayments: number = 0;
  loanPayments: number = 0;
  
  // Filter properties
  searchTerm: string = '';
  typeFilter: string = 'all';
  statusFilter: string = 'all';
  methodFilter: string = 'all';
  dateRange = {
    start: null as Date | null,
    end: null as Date | null
  };

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.isLoading = true;
    this.apiService.getUserTransactions(userId.toString()).subscribe({
      next: (transactions) => {
        this.payments = transactions.map(t => ({
          id: t.id.toString(),
          transactionId: t.transaction_id || ('TXN' + t.id),
          amount: parseFloat(t.amount),
          type: t.type.toLowerCase().includes('loan') ? 'loan_emi' : 
                t.type.toLowerCase().includes('attendance') ? 'attendance' : 
                t.type.toLowerCase() as any,
          method: 'upi', // Default or fetch if available
          status: t.status ? t.status.toLowerCase() as any : 'completed',
          date: new Date(t.createdAt),
          description: t.description || (t.type + ' Payment'),
          meetingTitle: t.meeting_id ? 'Meeting Payment' : undefined,
          loanNumber: t.loan_id ? ('LN' + t.loan_id) : undefined
        }));
        this.filteredPayments = [...this.payments];
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.isLoading = false;
      }
    });
  }


  calculateStatistics() {
    this.totalPaid = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    this.pendingPayments = this.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    this.attendancePayments = this.payments
      .filter(p => p.type === 'attendance' && p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    this.loanPayments = this.payments
      .filter(p => p.type === 'loan_emi' && p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  applyFilters() {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesSearch = payment.transactionId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          payment.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = this.typeFilter === 'all' || payment.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || payment.status === this.statusFilter;
      const matchesMethod = this.methodFilter === 'all' || payment.method === this.methodFilter;
      
      const matchesDate = (!this.dateRange.start || payment.date >= this.dateRange.start) &&
                         (!this.dateRange.end || payment.date <= this.dateRange.end);

      return matchesSearch && matchesType && matchesStatus && matchesMethod && matchesDate;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.typeFilter = 'all';
    this.statusFilter = 'all';
    this.methodFilter = 'all';
    this.dateRange = { start: null, end: null };
    this.filteredPayments = [...this.payments];
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusTranslation(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'Completed',
      'pending': 'Pending',
      'failed': 'Failed'
    };
    return statusMap[status] || status;
  }

  getTypeTranslation(type: string): string {
    const typeMap: { [key: string]: string } = {
      'attendance': 'Attendance Fee',
      'loan_emi': 'Loan EMI',
      'loan_application': 'Loan Application',
      'savings': 'Savings'
    };
    return typeMap[type] || type;
  }

  getMethodIcon(method: string): string {
    const iconMap: { [key: string]: string } = {
      'upi': 'qr_code',
      'cash': 'payments',
      'bank_transfer': 'account_balance'
    };
    return iconMap[method] || 'payment';
  }

  getMethodTranslation(method: string): string {
    const methodMap: { [key: string]: string } = {
      'upi': 'UPI',
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer'
    };
    return methodMap[method] || method;
  }

  getFormattedAmount(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  downloadReceipt(payment: Payment) {
    // Implement receipt download
    console.log('Download receipt for:', payment.transactionId);
  }

  viewPaymentDetails(payment: Payment) {
    // Implement payment details view
    console.log('View details for:', payment.transactionId);
  }
}

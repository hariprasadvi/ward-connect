import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Loan {
  id?: number;
  userId: number;
  groupId: number;
  amount: number;
  purpose: string;
  tenure_months: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Closed';
  risk_score?: number;
  ai_analysis?: string;
  repaid_amount?: number;
  overdue_amount?: number;
  last_penalty_check_date?: Date;
  start_date?: Date;
  loanNumber?: string; // Frontend often expects this
  User?: {
    full_name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/kudumbashree/loan`; // Adjust base URL if needed

  applyLoan(loanData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply`, loanData);
  }

  getLoans(userId?: number, groupId?: number): Observable<Loan[]> {
    let params: any = {};
    if (userId) params.userId = userId;
    if (groupId) params.groupId = groupId;
    return this.http.get<Loan[]>(this.apiUrl, { params });
  }

  updateLoanStatus(id: number, status: string, admin_comments?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status, admin_comments });
  }

  repayLoan(id: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/repay`, { amount });
  }

  remindPayment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/remind-payment`, {});
  }
}

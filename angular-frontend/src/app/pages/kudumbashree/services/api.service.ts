import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting, Loan, Attendance} from '../models';
import { FinancialTransaction, FinancialReport} from '../models/financial'
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  // Meeting minutes endpoints
  recordMeetingAudio(meetingId: string, audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('meetingId', meetingId);
    return this.http.post(`${this.baseUrl}/meetings/record`, formData);
  }

  getMeetingTranscript(meetingId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/meetings/${meetingId}/transcript`);
  }

  // Attendance endpoints
  markAttendance(attendanceData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance`, attendanceData);
  }

  // Loan management endpoints
  applyLoan(loanData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/loans/apply`, loanData);
  }

  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/loans`);
  }

  // Meeting organizer endpoints
  scheduleMeeting(meetingData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/meetings/schedule`, meetingData);
  }

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.baseUrl}/meetings`);
  }


  // Attendance with payment
  markAttendanceWithPayment(attendanceData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance/mark-with-payment`, attendanceData);
  }

  generatePaymentQR(attendanceId: string, amount: number): Observable<{ qrCode: string; transactionId: string }> {
    return this.http.post<{ qrCode: string; transactionId: string }>(
      `${this.baseUrl}/attendance/generate-payment-qr`,
      { attendanceId, amount }
    );
  }

  verifyPayment(transactionId: string): Observable<{ verified: boolean; transaction: any }> {
    return this.http.get<{ verified: boolean; transaction: any }>(
      `${this.baseUrl}/payments/verify/${transactionId}`
    );
  }

  // Financial reports
  getFinancialReport(dateRange: any): Observable<FinancialReport> {
    return this.http.post<FinancialReport>(`${this.baseUrl}/financial/report`, dateRange);
  }

  getAttendanceCollections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/financial/attendance-collections`);
  }

  recordPayment(paymentData: any): Observable<FinancialTransaction> {
    return this.http.post<FinancialTransaction>(`${this.baseUrl}/financial/record-payment`, paymentData);
  }
}

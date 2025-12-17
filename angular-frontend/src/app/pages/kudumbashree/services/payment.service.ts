import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { FinancialTransaction, TransactionType, TransactionCategory, PaymentMethod, TransactionStatus } from '../models/financial';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private transactions = signal<FinancialTransaction[]>([]);
  private attendanceFee = 50; // Default attendance fee in rupees

  transactions$ = this.transactions.asReadonly();

  constructor(private apiService: ApiService) {}

  // Generate QR code data for UPI payment
  generateUPIQrCode(amount: number, description: string, userId: string): string {
    const upiId = 'kudumbashree@ybl'; // Example UPI ID
    const transactionNote = `Kudumbashree - ${description}`;
    
    // UPI URL format for QR code generation
    const upiUrl = `upi://pay?pa=${upiId}&pn=Kudumbashree%20Community&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
    
    return upiUrl;
  }

  // Simulate QR code generation (in real app, use a QR code library)
  generateQRCodeData(data: string): string {
    // In a real application, you would use a QR code generator library
    // For demo purposes, we'll return a mock QR code data URL
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#000000">
          QR Code: ${data.substring(0, 20)}...
        </text>
        <rect x="10" y="10" width="180" height="180" fill="none" stroke="#000000" stroke-width="2"/>
      </svg>
    `)}`;
  }

  // Record attendance fee payment
  async recordAttendancePayment(attendanceData: any): Promise<{ success: boolean; qrCode?: string; transactionId?: string }> {
    try {
      // Generate transaction ID
      const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Generate QR code for payment
      const upiUrl = this.generateUPIQrCode(
        this.attendanceFee,
        `Attendance Fee - ${attendanceData.meetingTitle}`,
        attendanceData.userId
      );
      
      const qrCode = this.generateQRCodeData(upiUrl);

      // Create financial transaction
      const transaction: FinancialTransaction = {
        id: transactionId,
        transactionId: transactionId,
        type: TransactionType.INCOME,
        amount: this.attendanceFee,
        description: `Attendance fee for ${attendanceData.meetingTitle}`,
        category: TransactionCategory.ATTENDANCE_FEE,
        date: new Date(),
        userId: attendanceData.userId,
        userName: attendanceData.userName,
        meetingId: attendanceData.meetingId,
        meetingTitle: attendanceData.meetingTitle,
        paymentMethod: PaymentMethod.QR_CODE,
        status: TransactionStatus.PENDING,
        qrCode: qrCode,
        referenceNumber: transactionId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to local transactions (in real app, send to backend)
      this.transactions.update(transactions => [...transactions, transaction]);

      return {
        success: true,
        qrCode: qrCode,
        transactionId: transactionId
      };
    } catch (error) {
      console.error('Error recording payment:', error);
      return { success: false };
    }
  }

  // Verify payment (simulated)
  async verifyPayment(transactionId: string): Promise<{ verified: boolean; transaction?: FinancialTransaction }> {
    return new Promise((resolve) => {
      // Simulate payment verification delay
      setTimeout(() => {
        const transaction = this.transactions().find(t => t.transactionId === transactionId);
        if (transaction) {
          // Update transaction status to completed
          this.transactions.update(transactions => 
            transactions.map(t => 
              t.transactionId === transactionId 
                ? { ...t, status: TransactionStatus.COMPLETED, updatedAt: new Date() }
                : t
            )
          );
          
          resolve({ verified: true, transaction });
        } else {
          resolve({ verified: false });
        }
      }, 2000);
    });
  }

  // Get attendance fee amount
  getAttendanceFee(): number {
    return this.attendanceFee;
  }

  // Get transactions for reporting
  getTransactions(): FinancialTransaction[] {
    return this.transactions();
  }

  // Get total collection
  getTotalCollection(): number {
    return this.transactions()
      .filter(t => t.status === TransactionStatus.COMPLETED)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }
}
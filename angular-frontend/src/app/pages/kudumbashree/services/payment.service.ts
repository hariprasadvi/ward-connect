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
  async recordAttendancePayment(attendanceData: any): Promise<{ success: boolean; orderId?: string; amount?: number; key?: string }> {
    try {
        // Step 1: Create Order on Backend
        const response: any = await this.apiService['createRazorpayOrder'](this.attendanceFee).toPromise();
        
        return {
            success: true,
            orderId: response.id,
            amount: response.amount,
            key: response.key_id
        };
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      // Re-throw so component can show the specific backend error message
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(transactionId: string): Promise<{ verified: boolean; transaction?: FinancialTransaction }> {
      try {
        const response = await this.apiService.verifyPayment(transactionId).toPromise();
        return {
            verified: response?.verified ?? false, // Handle undefined response
            transaction: response?.transaction
        };
      } catch (e) {
          console.error(e);
          return { verified: false };
      }
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

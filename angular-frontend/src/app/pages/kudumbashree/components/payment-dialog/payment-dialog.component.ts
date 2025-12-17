import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { PaymentService } from '../../services/payment.service';

export interface PaymentDialogData {
  qrCode: string;
  amount: number;
  transactionId: string;
  description: string;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.scss'
})
export class PaymentDialogComponent {
  private paymentService = inject(PaymentService);
  
  isVerifying = false;
  paymentVerified = false;
  paymentFailed = false;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {}

  async verifyPayment() {
    this.isVerifying = true;
    this.paymentFailed = false;

    try {
      const result = await this.paymentService.verifyPayment(this.data.transactionId);
      
      if (result.verified) {
        this.paymentVerified = true;
        setTimeout(() => {
          this.dialogRef.close({ paid: true, transaction: result.transaction });
        }, 2000);
      } else {
        this.paymentFailed = true;
      }
    } catch (error) {
      this.paymentFailed = true;
    } finally {
      this.isVerifying = false;
    }
  }

  cancelPayment() {
    this.dialogRef.close({ paid: false });
  }
}
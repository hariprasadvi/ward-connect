import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LoanService } from '../../services/loan.service';
import { ApiService } from '../../services/api.service';

declare var Razorpay: any;

@Component({
  selector: 'app-pay-loan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './pay-loan-dialog.component.html',
  styleUrls: ['./pay-loan-dialog.component.scss']
})
export class PayLoanDialogComponent {
  private fb = inject(FormBuilder);
  private loanService = inject(LoanService);
  private apiService = inject(ApiService);
  
  paymentForm: FormGroup;
  loan: any;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<PayLoanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loan = data.loan;
    
    // Calculate outstanding safely
    const outstanding = this.outstandingAmount;

    this.paymentForm = this.fb.group({
      amount: [outstanding, [Validators.required, Validators.min(1), Validators.max(outstanding)]]
    });
  }

  get outstandingAmount(): number {
      const amount = Number(this.loan.amount) || 0;
      const repaid = Number(this.loan.repaid_amount) || 0;
      const overdue = Number(this.loan.overdue_amount) || 0;
      return amount - repaid + overdue;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  payWithRazorpay() {
    if (this.paymentForm.invalid) return;
    
    this.isLoading = true;
    const amount = this.paymentForm.get('amount')?.value;

    // 1. Create Order
    this.apiService.createRazorpayOrder(amount).subscribe({
      next: (order) => {
        this.openCheckout(order, amount);
      },
      error: (err) => {
        console.error('Order Creation Failed', err);
        alert('Failed to initiate payment. Please try again.');
        this.isLoading = false;
      }
    });
  }

  openCheckout(order: any, amount: number) {
    const options = {
      "key": order.key_id, // Enter the Key ID generated from the Dashboard
      "amount": order.amount, // Amount is in currency subunits. Default currency is INR.
      "currency": "INR",
      "name": "Kudumbashree Loan Repayment",
      "description": `Loan Repayment for #${this.loan.loanNumber || this.loan.id}`,
      "order_id": order.id, 
      "handler": (response: any) => {
         // Payment Successful
         this.verifyAndRecordPayment(response, amount);
      },
      "prefill": {
        "name": "", // Can be filled with user details
        "email": "",
        "contact": ""
      },
      "theme": {
        "color": "#3399cc"
      },
      "modal": {
          "ondismiss": () => {
              this.isLoading = false;
          }
      }
    };
    
    const rzp1 = new Razorpay(options);
    rzp1.open();
  }

  verifyAndRecordPayment(response: any, amount: number) {
      // In a real app, verify signature on backend.
      // For now, we trust success and call repayLoan directly or verify endpoint
      
      const verificationData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
      };

      this.apiService.verifyRazorpayPayment(verificationData).subscribe({
          next: (res) => {
              if (res.success) {
                  // Now actually update the loan record
                  this.loanService.repayLoan(this.loan.id, amount).subscribe({
                      next: () => {
                          alert('Payment Successful!');
                          this.dialogRef.close(true);
                      },
                      error: (err) => {
                           alert('Payment recorded at gateway but failed to update local records. Please contact admin.');
                           this.dialogRef.close(true); // Close anyway as money is deducted
                      }
                  });
              } else {
                  alert('Payment verification failed!');
                  this.isLoading = false;
              }
          },
          error: (err) => {
              console.error("Verification Error", err);
               alert('Payment verification error.');
               this.isLoading = false;
          }
      });
  }
}

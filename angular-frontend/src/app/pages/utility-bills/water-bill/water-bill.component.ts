
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillService } from '../../../services/bill.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';

declare var Razorpay: any;

@Component({
  selector: 'app-water-bill',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './water-bill.component.html',
  styleUrls: ['./water-bill.component.css']
})
export class WaterBillComponent implements OnInit {
  consumerNumber: string = '';
  mobileNumber: string = '';
  captchaInput: string = '';
  captchaCode: string = '';

  fetchedBill: any = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private billService: BillService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.generateCaptcha();

    // First try valid cached user
    const user = this.authService.getCurrentUser();
    if (user && user.mobile_number) {
      this.mobileNumber = user.mobile_number;
    }

    // ALWAYS fetch fresh profile to be sure
    this.userService.getProfile().subscribe({
      next: (profile) => {
        if (profile && profile.mobile_number) {
          this.mobileNumber = profile.mobile_number;
        }
      },
      error: (err) => console.error('Failed to fetch profile:', err)
    });
  }

  generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.captchaCode = '';
    for (let i = 0; i < 6; i++) {
      this.captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  onConsumerNumberChange(val: string) {
    if (val === '1234567890123') {
      const user = this.authService.getCurrentUser();
      if (user && user.mobile_number) {
        this.mobileNumber = user.mobile_number;
      } else {
        this.userService.getProfile().subscribe({
          next: (profile) => {
            if (profile && profile.mobile_number) {
              this.mobileNumber = profile.mobile_number;
            }
          }
        });
      }
    }
  }

  fetchBill() {
    this.errorMessage = '';
    this.fetchedBill = null;

    // Validation for demo purposes usually 13 digits for electricity but maybe 8-15 for water. 
    // Keeping it 13 or flexible for demo. Let's say at least 5 digits.
    if (this.consumerNumber.length < 5) {
      this.errorMessage = 'Please enter a valid Consumer Number.';
      return;
    }
    if (this.mobileNumber.length !== 10) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    if (this.captchaInput.toUpperCase() !== this.captchaCode) {
      this.errorMessage = 'Invalid Captcha!';
      this.generateCaptcha();
      return;
    }

    this.isLoading = true;
    this.billService.fetchByConsumer(this.consumerNumber, 'Water').subscribe({
      next: (bill) => {
        this.fetchedBill = bill;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Fetch Error:', err);
        if (err.status === 404) {
          this.errorMessage = err.error?.message || "No pending bills found for this Consumer Number.";
        } else {
          this.errorMessage = "Failed to fetch bill details. Please check connection.";
        }
      }
    });
  }

  payBill() {
    if (!this.fetchedBill) return;

    const amount = parseFloat(this.fetchedBill.amount);

    this.billService.createOrder(amount).subscribe({
      next: (order: any) => {
        const options = {
          key: 'rzp_test_S3iNfkYOx5zNOb', // Public Key
          amount: order.amount,
          currency: 'INR',
          name: 'Ward Connect',
          description: `Payment for ${this.fetchedBill.billType} Bill`,
          order_id: order.id,
          handler: (response: any) => {
            this.verifyPayment(response);
          },
          prefill: {
            name: 'Ward Connect User',
            contact: this.mobileNumber
          },
          theme: {
            color: '#3498db'
          }
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
      },
      error: (err: any) => {
        console.error('Order Creation Failed', err);
        alert('Failed to initiate payment. Please try again.');
      }
    });
  }

  verifyPayment(response: any) {
    const paymentData = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      billId: this.fetchedBill.id,
      isDemo: this.fetchedBill.isDemo || false,
      amount: this.fetchedBill.amount,
      consumerNumber: this.fetchedBill.consumerNumber,
      billType: this.fetchedBill.billType
    };

    this.billService.verifyPayment(paymentData).subscribe({
      next: (res: any) => {
        alert('Payment Successful! Downloading Receipt...');
        this.generateReceipt(res.bill || this.fetchedBill, response.razorpay_payment_id);
        this.router.navigate(['/utilities']);
      },
      error: (err: any) => {
        alert('Payment Verification Failed!');
      }
    });
  }

  generateReceipt(bill: any, paymentId: string) {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Ward Connect - Payment Receipt', 20, 20);

    doc.setFontSize(12);
    doc.text(`Transaction ID: ${paymentId}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 50);
    doc.text(`Consumer Number: ${bill.consumerNumber}`, 20, 60);
    doc.text(`Bill Type: ${bill.billType}`, 20, 70);

    doc.setFontSize(16);
    doc.text(`Amount Paid: Rs. ${bill.amount}`, 20, 90);

    doc.setFontSize(10);
    doc.text('Thank you for using Ward Connect!', 20, 110);
    doc.text('This is a computer generated receipt.', 20, 115);

    doc.save(`Receipt_${bill.consumerNumber}_${new Date().getTime()}.pdf`);
  }
}

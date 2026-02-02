
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
  selector: 'app-gas-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gas-booking.component.html',
  styleUrls: ['./gas-booking.component.css']
})
export class GasBookingComponent implements OnInit {
  providers = [
    { id: 'BPCL', name: 'Bharat Gas (BPCL)' },
    { id: 'COMMERCIAL', name: 'Bharat Gas Commercial' },
    { id: 'INDANE', name: 'Indane Gas' },
    { id: 'HP', name: 'HP Gas' }
  ];

  selectedProvider: string = '';
  mobileNumber: string = '';
  quantity: number = 1;
  unitPrice: number = 950; // Base price
  totalAmount: number = 950;
  svNumber: string = '';

  isLoading: boolean = false;

  constructor(
    private billService: BillService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit() {
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
  isCommercial(): boolean {
    return this.selectedProvider === 'COMMERCIAL';
  }

  onProviderChange() {
    // Reset fields on provider change
    this.quantity = 1;
    this.svNumber = '';
    this.updateTotal();
  }

  updateTotal() {
    if (this.isCommercial()) {
      // Commercial Limit: 100
      if (this.quantity > 100) this.quantity = 100;
      if (this.quantity < 1) this.quantity = 1;
    } else {
      // Others: Fixed at 1
      this.quantity = 1;
    }
    this.totalAmount = this.quantity * this.unitPrice;
  }

  bookAndPay() {
    if (!this.selectedProvider) {
      alert('Please select a Gas Provider');
      return;
    }
    if (!this.mobileNumber || this.mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (this.isCommercial()) {
      if (!this.svNumber) {
        alert('Please enter SV Number for Commercial booking');
        return;
      }
      if (this.quantity > 100) {
        alert('Maximum limit for commercial cylinders is 100');
        this.quantity = 100;
        this.updateTotal();
        return;
      }
    }

    this.isLoading = true;

    this.billService.createOrder(this.totalAmount).subscribe({
      next: (order: any) => {
        const options = {
          key: 'rzp_test_S3iNfkYOx5zNOb',
          amount: order.amount,
          currency: 'INR',
          name: 'Ward Connect',
          description: `Gas Booking - ${this.getPoviderName()}`,
          order_id: order.id,
          handler: (response: any) => {
            this.verifyPayment(response);
          },
          prefill: {
            name: 'Ward Connect User',
            contact: this.mobileNumber
          },
          theme: {
            color: '#e67e22'
          }
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Order Error', err);
        this.isLoading = false;
        alert('Could not initiate payment. Try again.');
      }
    });
  }

  verifyPayment(response: any) {
    const paymentData = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      billId: null, // No existing bill, creating new
      isDemo: true, // Treat as ad-hoc payment
      amount: this.totalAmount,
      consumerNumber: this.mobileNumber, // Store mobile as consumer number for gas
      billType: `Gas - ${this.getPoviderName()}`,
      billData: {
        quantity: this.quantity,
        provider: this.selectedProvider,
        svNumber: this.isCommercial() ? this.svNumber : 'N/A'
      }
    };

    this.billService.verifyPayment(paymentData).subscribe({
      next: (res: any) => {
        alert('Booking Successful! Receipt will be downloaded.');
        this.generateReceipt(res.bill, response.razorpay_payment_id);
        this.router.navigate(['/utilities']);
      },
      error: (err: any) => {
        console.error(err);
        alert('Payment Verification Failed');
      }
    });
  }

  generateReceipt(bill: any, paymentId: string) {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(230, 126, 34); // Orange for Gas
    doc.text('Ward Connect - Gas Booking Receipt', 20, 20);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(12);
    doc.text(`Transaction ID: ${paymentId}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 50);
    doc.text(`Registered Mobile: ${this.mobileNumber}`, 20, 60);
    doc.text(`Provider: ${this.getPoviderName()}`, 20, 70);
    doc.text(`Quantity: ${this.quantity} Cylinder(s)`, 20, 80);

    if (this.isCommercial()) {
      doc.text(`SV Number: ${this.svNumber}`, 20, 90);
      doc.text(`Category: COMMERCIAL`, 20, 100);
    } else {
      doc.text(`Category: DOMESTIC`, 20, 90);
    }

    doc.setFontSize(16);
    doc.text(`Amount Paid: Rs. ${this.totalAmount}`, 20, 115);

    doc.setFontSize(10);
    doc.text('Your booking is confirmed. Delivery within 2-3 working days.', 20, 130);
    doc.text('Thank you for using Ward Connect!', 20, 135);
    doc.text('This is a computer generated receipt.', 20, 140);

    doc.save(`GasBooking_${this.mobileNumber}_${new Date().getTime()}.pdf`);
  }

  getPoviderName() {
    const p = this.providers.find(x => x.id === this.selectedProvider);
    return p ? p.name : this.selectedProvider;
  }
}

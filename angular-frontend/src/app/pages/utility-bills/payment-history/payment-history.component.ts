
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService } from '../../../services/bill.service';
import { jsPDF } from 'jspdf';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  bills: any[] = [];
  isLoading: boolean = true;

  constructor(private billService: BillService, private router: Router) { }

  ngOnInit() {
    this.billService.getBills().subscribe({
      next: (data) => {
        // Filter to only display 'Paid' bills, and sort by payment date (newest first)
        this.bills = data
          .filter((b: any) => b.status === 'Paid')
          .sort((a: any, b: any) => {
            const dateA = new Date(a.paymentDate || a.dueDate).getTime();
            const dateB = new Date(b.paymentDate || b.dueDate).getTime();
            return dateB - dateA;
          });
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  downloadReceipt(bill: any) {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Ward Connect - Payment Receipt', 20, 20);

    doc.setFontSize(12);
    doc.text(`Transaction ID: TRANS_${bill.id}`, 20, 40);
    doc.text(`Payment Date: ${new Date(bill.paymentDate).toLocaleString()}`, 20, 50);
    doc.text(`Consumer Number: ${bill.consumerNumber}`, 20, 60);
    doc.text(`Bill Type: ${bill.billType || 'Utility'}`, 20, 70);

    doc.setFontSize(16);
    doc.text(`Amount Paid: Rs. ${bill.amount}`, 20, 90);

    doc.setFontSize(10);
    doc.text('Thank you for using Ward Connect!', 20, 110);
    doc.save(`Receipt_${bill.consumerNumber}.pdf`);
  }

  goBack() {
    this.router.navigate(['/utilities']);
  }
}

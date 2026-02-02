import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService } from '../../services/bill.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-utility-bills',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './utility-bills.component.html',
    styleUrls: ['./utility-bills.component.css']
})
export class UtilityBillsComponent implements OnInit {
    bills: any[] = [];
    filteredBills: any[] = [];
    selectedType: string = 'Electricity';

    // Stats
    totalDue = 0;

    constructor(private billService: BillService, private router: Router) { }

    ngOnInit() {
        this.fetchBills();
    }

    fetchBills() {
        this.billService.getBills().subscribe({
            next: (data) => {
                this.bills = data;
                // Only filter if staying on page, but user might come back
                this.filterBills(this.selectedType, false);
                this.calculateStats();
            },
            error: (err) => console.error('Error fetching bills:', err)
        });
    }

    filterBills(type: string, navigate: boolean = true) {
        if (type === 'Electricity' && navigate) {
            this.router.navigate(['/utilities/electricity']);
            return;
        }

        if (type === 'Water' && navigate) {
            this.router.navigate(['/utilities/water']);
            return;
        }

        if (type === 'Gas' && navigate) {
            this.router.navigate(['/utilities/gas']);
            return;
        }

        this.selectedType = type;
        this.filteredBills = this.bills.filter(b => b.billType === type);
    }

    calculateStats() {
        this.totalDue = this.bills
            .filter(b => b.status !== 'Paid')
            .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    }

    pay(bill: any) {
        if (confirm(`Pay ₹${bill.amount} for ${bill.billType}?`)) {
            this.billService.payBill(bill.id).subscribe({
                next: () => {
                    alert('Payment Successful!');
                    this.fetchBills();
                },
                error: (err: any) => alert('Payment failed!')
            });
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Paid': return 'status-paid';
            case 'Pending': return 'status-pending';
            case 'Overdue': return 'status-overdue';
            default: return '';
        }
    }
}

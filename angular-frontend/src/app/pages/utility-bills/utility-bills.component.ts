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

    // Status Banner Variables
    showBanner = false;
    bannerType: 'overdue' | 'upcoming' | 'all-set' | 'none' = 'none';
    bannerMessage: string = '';
    bannerIcon: string = '';
    bannerLink: string = '/utilities';

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
                this.checkBillStatus();
            },
            error: (err) => console.error('Error fetching bills:', err)
        });
    }

    checkBillStatus() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Discard 'Paid' bills
        const unpaidBills = this.bills.filter((b: any) => b.status !== 'Paid');

        if (unpaidBills.length === 0) {
            this.bannerType = 'all-set';
            this.bannerMessage = "No pending bills. You're all set.";
            this.bannerIcon = "✅";
            this.bannerLink = "history";
            this.showBanner = true;
            return;
        }

        // Identify overdue bills
        const overdueBills = unpaidBills.filter((b: any) => {
            if (b.status === 'Overdue') return true;
            if (b.dueDate) {
                const dDate = new Date(b.dueDate);
                dDate.setHours(0,0,0,0);
                return dDate.getTime() < today.getTime();
            }
            return false;
        });

        if (overdueBills.length > 0) {
            this.bannerType = 'overdue';
            this.bannerIcon = "⚠️";
            if (overdueBills.length === 1) {
                this.bannerMessage = `You have 1 overdue ${overdueBills[0].billType?.toLowerCase() || ''} bill. Please pay immediately to avoid service interruption.`;
            } else {
                const types = overdueBills.map((b:any) => b.billType).join(', ');
                this.bannerMessage = `You have ${overdueBills.length} overdue bills (${types}). Please pay immediately to avoid service interruption.`;
            }
            this.bannerLink = `/utilities/${overdueBills[0].billType?.toLowerCase() || 'electricity'}`;
            this.showBanner = true;
            return;
        }

        // Upcoming Bills
        const upcomingBills = unpaidBills.sort((a:any, b:any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const nearestBill = upcomingBills[0];
        const tDate = new Date(nearestBill.dueDate);
        const day = tDate.getDate();
        const month = tDate.toLocaleString('default', { month: 'long' });
        const suffix = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
        
        this.bannerType = 'upcoming';
        this.bannerIcon = "📅";
        this.bannerMessage = `Your ${nearestBill.billType?.toLowerCase() || 'utility'} bill is due on ${day}${suffix} ${month}.`;
        this.bannerLink = `/utilities/${nearestBill.billType?.toLowerCase() || 'electricity'}`;
        this.showBanner = true;
    }

    dismissBanner() {
        this.showBanner = false;
    }

    scrollToServices() {
        const el = document.getElementById('services-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
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

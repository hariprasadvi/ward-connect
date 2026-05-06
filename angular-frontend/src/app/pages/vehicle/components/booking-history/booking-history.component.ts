import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../../../services/vehicle.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
    selector: 'app-booking-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './booking-history.component.html',
    styleUrls: ['./booking-history.component.css']
})
export class BookingHistoryComponent implements OnInit {
    @Input() mode: 'user' | 'owner' = 'user'; // Can be used as a child component
    bookings: any[] = [];
    loading = true;
    totalRides = 0;
    totalAmount = 0;

    // Rating Modal State
    showRatingModal = false;
    selectedRating = 0;
    hoverRating = 0;
    selectedBooking: any = null;

    constructor(
        private vehicleService: VehicleService,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        // Auto-detect mode if default 'user' is passed but user is an Owner
        // We assume 'Vehicle Owner' role string based on the User model
        if (user.role === 'Vehicle Owner') {
            this.mode = 'owner';
        } else {
            this.mode = 'user';
        }

        if (this.mode === 'user') {
            this.loadUserHistory(user.id);
        } else {
            this.loadOwnerHistory(user.id);
        }
    }

    loadUserHistory(userId: number) {
        this.loading = true;
        this.vehicleService.getUserHistory(userId).subscribe({
            next: (data) => {
                this.bookings = data;
                this.calculateStats();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    loadOwnerHistory(ownerId: number) {
        this.loading = true;
        this.vehicleService.getOwnerHistory(ownerId).subscribe({
            next: (data) => {
                this.bookings = data;
                this.calculateStats();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    calculateStats() {
        this.totalRides = this.bookings.length;
        this.totalAmount = this.bookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    rateDriver(booking: any) {
        this.selectedBooking = booking;
        this.selectedRating = 0;
        this.hoverRating = 0;
        this.showRatingModal = true;
    }

    closeRatingModal() {
        this.showRatingModal = false;
        this.selectedBooking = null;
    }

    submitRating() {
        if (!this.selectedBooking || this.selectedRating === 0) {
            this.toastService.show('Please select a rating', 'warning');
            return;
        }

        this.vehicleService.rateVehicle(this.selectedBooking.id, this.selectedRating).subscribe({
            next: (res) => {
                this.toastService.show('Thank you for your feedback!', 'success');
                this.closeRatingModal();
                // Optionally update the local booking object to prevent re-rating
                this.selectedBooking.isRated = true; 
            },
            error: (err) => {
                this.toastService.show('Error submitting rating', 'error');
            }
        });
    }
}

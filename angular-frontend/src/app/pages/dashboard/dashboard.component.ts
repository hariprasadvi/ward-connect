import { Component } from '@angular/core';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { PickupService } from '../waste/core/services/pickup.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterModule, MatIconModule],
    templateUrl: './dashboard.component.html',
    styles: []
})
export class DashboardComponent {
    user: any;
    wasteNotificationCount = 0;

    constructor(
        private authService: AuthService,
        private pickupService: PickupService,
        private router: Router
    ) {
        this.user = this.authService.getCurrentUser();
        this.loadNotifications();
    }

    loadNotifications() {
        if (this.hasWasteAccess()) {
            this.pickupService.getNotificationCount().subscribe({
                next: (res) => this.wasteNotificationCount = res.count,
                error: (err) => console.error('Failed to load notifications', err)
            });
        }
    }

    hasWasteAccess(): boolean {
        // Module is now visible to all registered users
        return !!this.user;
    }

    logout() {
        this.authService.logout();
    }

    navigateToVehicle() {
        this.router.navigate(['/vehicle']);
    }
}

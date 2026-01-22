import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-health',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    templateUrl: './health.component.html',
    styleUrls: ['./health.component.css']
})
export class HealthComponent {
    private authService = inject(AuthService);

    get isHealthWorker(): boolean {
        return this.authService.hasRole('Health Worker');
    }

    get cards() {
        if (this.isHealthWorker) {
            return [
                { to: '/health/dashboard', title: 'Community Statistics', desc: 'Update real-time health data and alerts.', icon: 'analytics', color: '#f59e0b' },
                { to: '/health/donation', title: 'Blood Donation Requests', desc: 'Manage and approve blood donation requests.', icon: 'thumb_up', color: '#ec4899' },
                { to: '/health/insurance', title: 'Scheme Management', desc: 'Add new government and private health schemes.', icon: 'admin_panel_settings', color: '#8b5cf6' },
            ];
        } else {
            return [
                { to: '/health/medicines', title: 'Medicine Reminder', desc: 'Never miss a dose with smart scheduling.', icon: 'monitor_heart', color: 'var(--primary)' },
                { to: '/health/vault', title: 'Health Vault', desc: 'Securely store and access your medical records.', icon: 'security', color: 'var(--secondary)' },
                { to: '/health/dashboard', title: 'Community Dashboard', desc: 'View local health trends and alerts.', icon: 'groups', color: '#f59e0b' },
                { to: '/health/donation', title: 'Blood Donation', desc: 'Life-saving matching system.', icon: 'favorite', color: '#ec4899' },
                { to: '/health/insurance', title: 'Insurance Checker', desc: 'Check eligibility for health schemes.', icon: 'description', color: '#8b5cf6' },
            ];
        }
    }
}

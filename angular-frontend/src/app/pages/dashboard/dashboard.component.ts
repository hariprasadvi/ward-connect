import { Component } from '@angular/core';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterModule],
    templateUrl: './dashboard.component.html',
    styles: []
})
export class DashboardComponent {
    user: any;

    constructor(private authService: AuthService) {
        this.user = this.authService.getCurrentUser();
    }

    logout() {
        this.authService.logout();
    }
}

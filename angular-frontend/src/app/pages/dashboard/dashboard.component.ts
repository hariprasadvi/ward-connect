import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
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

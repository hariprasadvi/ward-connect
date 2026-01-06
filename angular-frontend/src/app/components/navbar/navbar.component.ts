import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
    user$;
    isMenuOpen = false;

    constructor(private authService: AuthService, private router: Router) {
        this.user$ = this.authService.user$;
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}

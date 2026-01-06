import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-waste-redirect',
  standalone: true,
  template: '<div class="flex items-center justify-center h-screen"><p>Redirecting...</p></div>'
})
export class WasteRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user: any = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Route based on role
    if (user.role === 'Waste Management Staff') {
      this.router.navigate(['/waste/admin/dashboard']);
    } else {
      // Everyone else (Citizen, Kudumbashree, etc.) gets the user dashboard
      this.router.navigate(['/waste/user/dashboard']);
    }
  }
}





import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-vehicle-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-entry.component.html',
  styles: []
})
export class VehicleEntryComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    
    if (user && user.role === 'Vehicle Owner') {
        this.router.navigate(['/vehicle/owner']);
    } else {
        this.router.navigate(['/vehicle/search']);
    }
  }
}

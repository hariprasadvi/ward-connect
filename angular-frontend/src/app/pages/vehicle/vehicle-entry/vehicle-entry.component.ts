import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-entry.component.html',
  styles: []
})
export class VehicleEntryComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Force default to User/Passenger role to ensure citizens see the Map
    // This fixes the issue where previous testing stuck the user in 'owner' mode
    localStorage.setItem('vehicle_role', 'user');
    this.router.navigate(['/vehicle/search']);
  }
}

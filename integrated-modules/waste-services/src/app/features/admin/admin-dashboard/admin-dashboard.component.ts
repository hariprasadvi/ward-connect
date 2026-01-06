import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PickupService } from '../../../core/services/pickup.service';
import { ComplaintService } from '../../../core/services/complaint.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalPickups: 0,
    pendingPickups: 0,
    totalComplaints: 0,
    pendingComplaints: 0
  };

  constructor(
    private pickupService: PickupService,
    private complaintService: ComplaintService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.pickupService.getAllPickups().subscribe(pickups => {
      this.stats.totalPickups = pickups.length;
      this.stats.pendingPickups = pickups.filter(p => p.status === 'pending').length;
    });

    this.complaintService.getAllComplaints().subscribe(complaints => {
      this.stats.totalComplaints = complaints.length;
      this.stats.pendingComplaints = complaints.filter(c => c.status === 'pending').length;
    });
  }
}

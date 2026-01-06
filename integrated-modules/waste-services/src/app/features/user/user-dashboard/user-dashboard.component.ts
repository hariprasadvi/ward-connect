import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { PickupService } from '../../../core/services/pickup.service';
import { ComplaintService } from '../../../core/services/complaint.service';
import { PickupRequest } from '../../../core/models/pickup.model';
import { Complaint } from '../../../core/models/complaint.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userName = '';
  upcomingPickups: PickupRequest[] = [];
  recentComplaints: Complaint[] = [];

  constructor(
    private authService: AuthService,
    private pickupService: PickupService,
    private complaintService: ComplaintService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.name;
      this.loadUserData(user);
    }
  }

  loadUserData(user: User): void {
    const userId = user.id;
    const houseNumber = user.houseNumber;

    if (houseNumber) {
        this.pickupService.getPickupsByHouseNumber(houseNumber).subscribe(pickups => {
            this.upcomingPickups = pickups
                .filter(p => p.status !== 'completed' && p.status !== 'cancelled')
                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                .slice(0, 3);
        });
    } else {
        // Fallback for users without house number (legacy behavior)
        this.pickupService.getUserPickups(userId).subscribe(pickups => {
            this.upcomingPickups = pickups
                .filter(p => p.status !== 'completed' && p.status !== 'cancelled')
                .slice(0, 3);
        });
    }

    this.complaintService.getUserComplaints(userId).subscribe(complaints => {
      this.recentComplaints = complaints.slice(0, 3);
    });
  }
}

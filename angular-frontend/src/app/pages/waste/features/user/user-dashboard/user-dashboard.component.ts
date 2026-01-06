import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { PickupService } from '../../../core/services/pickup.service';
import { ComplaintService } from '../../../core/services/complaint.service';
import { MessageService } from '../../../../../services/message.service';
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
  historyPickups: PickupRequest[] = [];
  recentComplaints: Complaint[] = [];
  houseAlerts: any[] = [];

  constructor(
    private authService: AuthService,
    private pickupService: PickupService,
    private complaintService: ComplaintService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const user: any = this.authService.currentUserValue;
    if (user) {
      this.userName = (user.full_name || user.name);
      this.loadUserData(user);
    }
  }

  loadUserData(user: User): void {
    const userId = user.id;
    const houseNumber = user.houseNumber;

    if (houseNumber) {
        this.pickupService.getPickupsByHouseNumber(houseNumber).subscribe(pickups => {
            // Sort helper
            const byDateDesc = (a: any, b: any) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
            const byDateAsc = (a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();

            // HISTORY: Completed, Cancelled, Confirmed, OR Acknowledged
            this.historyPickups = pickups.filter(p => 
                p.status.toLowerCase() === 'completed' || 
                p.status.toLowerCase() === 'cancelled' || 
                p.status.toLowerCase() === 'confirmed' ||
                p.isUserAcknowledged
            ).sort(byDateDesc).slice(0, 5);

            // UPCOMING: Inbox Zero style - Only Unacknowledged & Active (Pending/Scheduled)
            this.upcomingPickups = pickups.filter(p => 
                !p.isUserAcknowledged &&
                p.status.toLowerCase() !== 'completed' && 
                p.status.toLowerCase() !== 'cancelled' && 
                p.status.toLowerCase() !== 'confirmed'
            ).sort(byDateAsc).slice(0, 5);

            // Generate alerts for Admin Scheduled pickups (Unacknowledged)
            const adminPickups = this.upcomingPickups.filter(p => p.isAdminScheduled && !p.isUserAcknowledged);
            adminPickups.forEach(p => {
                const message = `Scheduled Pickup: ${p.wasteType || 'General Waste'}. 
Date: ${new Date(p.scheduledDate).toLocaleDateString()} at ${p.scheduledTime}. 
${p.description || ''}`;

                this.houseAlerts.unshift({
                    id: p.id,
                    type: 'Pickup Scheduled',
                    message: message,
                    createdAt: new Date().toISOString()
                });
            });
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

    this.messageService.getMyAlerts().subscribe((alerts: any[]) => {
      // Merge backend alerts with local pickup alerts, avoiding duplicates if any
      const currentAlerts = this.houseAlerts.filter(a => a.type === 'Pickup Scheduled');
      this.houseAlerts = [...currentAlerts, ...alerts];
    });
  }


  acknowledgeAlert(alertId: string): void {
      if (!alertId) return;
      this.pickupService.acknowledgePickup(alertId).subscribe({
          next: () => {
              // Remove from Alert UI
              this.houseAlerts = this.houseAlerts.filter(a => a.id !== alertId);
              
              // Move from Upcoming to History
              const idx = this.upcomingPickups.findIndex(p => p.id === alertId);
              if (idx !== -1) {
                  const pickup = this.upcomingPickups[idx];
                  pickup.isUserAcknowledged = true;
                  
                  // Atomic UI update
                  this.upcomingPickups.splice(idx, 1); // Remove from upcoming
                  this.historyPickups.unshift(pickup); // Add to history
              }
          },
          error: (err) => console.error('Failed to acknowledge', err)
      });
  }

  deletePickup(pickupId: string): void {
    if (confirm('Are you sure you want to remove this pickup?')) {
      this.pickupService.deletePickup(pickupId).subscribe({
        next: () => {
          // Remove from Upcoming UI
          this.upcomingPickups = this.upcomingPickups.filter(p => p.id !== pickupId);
          // Remove from History if present
          this.historyPickups = this.historyPickups.filter(p => p.id !== pickupId);
           // Remove from Alerts if present (though upcoming handles this)
           this.houseAlerts = this.houseAlerts.filter(a => a.id !== pickupId);
        },
        error: (err) => console.error('Failed to delete pickup', err)
      });
    }
  }
}





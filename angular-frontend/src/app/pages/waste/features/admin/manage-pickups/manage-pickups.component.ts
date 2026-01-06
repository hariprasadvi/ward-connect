import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { PickupService } from '../../../core/services/pickup.service';
import { PickupRequest, PickupStatus } from '../../../core/models/pickup.model';

@Component({
  selector: 'app-manage-pickups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './manage-pickups.component.html',
  styleUrls: ['./manage-pickups.component.css']
})
export class ManagePickupsComponent implements OnInit {
  pickups: PickupRequest[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'userName', 'type', 'scheduledDate', 'status', 'actions'];
  
  selectedPickup: PickupRequest | null = null;
  vehicleNumber = '';

  constructor(
    private pickupService: PickupService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPickups();
  }

  loadPickups(): void {
    this.pickupService.getAllPickups().subscribe({
      next: (pickups) => {
        this.pickups = pickups;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectPickup(pickup: PickupRequest): void {
    this.selectedPickup = pickup;
    this.vehicleNumber = pickup.assignedVehicle || '';
  }

  assignVehicle(): void {
    if (!this.selectedPickup || !this.vehicleNumber.trim()) {
      return;
    }

    this.pickupService.assignVehicle(this.selectedPickup.id, this.vehicleNumber).subscribe({
      next: () => {
        this.snackBar.open('Vehicle assigned successfully', 'Close', { duration: 3000 });
        this.loadPickups();
        this.selectedPickup = null;
        this.vehicleNumber = '';
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to assign vehicle', 'Close', { duration: 3000 });
      }
    });
  }

  confirmPickup(pickupId: string): void {
    this.pickupService.confirmPickup(pickupId).subscribe({
      next: () => {
        this.snackBar.open('Pickup confirmed', 'Close', { duration: 3000 });
        this.loadPickups();
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to confirm pickup', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  deletePickup(pickupId: string): void {
    if (confirm('Are you sure you want to delete this pickup request? This action cannot be undone.')) {
      this.pickupService.deletePickup(pickupId).subscribe({
        next: () => {
          this.snackBar.open('Pickup deleted successfully', 'Close', { duration: 3000 });
          this.loadPickups();
          if (this.selectedPickup?.id === pickupId) {
            this.selectedPickup = null;
          }
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to delete pickup', 'Close', { duration: 3000 });
        }
      });
    }
  }
}





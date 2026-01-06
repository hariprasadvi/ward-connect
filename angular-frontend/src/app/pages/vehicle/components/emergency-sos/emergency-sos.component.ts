import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../../../services/vehicle.service';

@Component({
  selector: 'app-emergency-sos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emergency-sos.component.html',
  styleUrls: ['./emergency-sos.component.css']
})
export class EmergencySosComponent {
  isProcessing = false;
  sosStatus: string | null = null;
  dispatchedVehicle: any = null;

  // Demo user data
  userId = 101;

  constructor(private vehicleService: VehicleService) { }

  triggerSOS() {
    if (!confirm('Are you sure you want to trigger an EMERGENCY SOS? This will book the nearest ambulance immediately.')) {
      return;
    }

    this.isProcessing = true;

    // Simulate getting location
    const currentLocation = { latitude: 10.01, longitude: 76.31 };

    this.vehicleService.emergencySos({
      userId: this.userId,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    }).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.sosStatus = 'Emergency vehicle dispatched successfully!';
        this.dispatchedVehicle = res.vehicle;
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('SOS Failed', err);
        alert('Failed to find emergency vehicle! Please call 112 directly.');
      }
    });
  }

  closeModal() {
    this.sosStatus = null;
    this.dispatchedVehicle = null;
  }
}

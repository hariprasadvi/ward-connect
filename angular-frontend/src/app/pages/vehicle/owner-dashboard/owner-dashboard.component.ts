import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css']
})
export class OwnerDashboardComponent implements OnInit {
  newVehicle = {
    registrationNumber: '',
    type: 'Auto',
    driverName: '',
    contactNumber: '',
    latitude: 10.0, // Default for demo
    longitude: 76.3  // Default for demo
  };

  myVehicles: any[] = [];
  ownerId: number | null = null;
  currentUser: any;

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.ownerId = this.currentUser.id; // Assuming user object has an id property
      if (this.ownerId) {
        this.loadMyVehicles();
        this.loadBookingRequests();
      }
    }
  }

  loadMyVehicles() {
    if (!this.ownerId) return;
    this.vehicleService.getMyVehicles(this.ownerId).subscribe({
      next: (data) => this.myVehicles = data,
      error: (err) => console.error('Error loading vehicles', err)
    });
  }

  // --- Booking Requests Logic ---
  bookingRequests: any[] = [];

  loadBookingRequests() {
    if (!this.ownerId) return;
    this.vehicleService.getOwnerRequests(this.ownerId).subscribe({
      next: (data) => this.bookingRequests = data,
      error: (err) => console.error('Error loading requests', err)
    });

    // Poll every 10 seconds for new requests
    setTimeout(() => this.loadBookingRequests(), 10000);
  }

  acceptBooking(booking: any, amountInput: string) {
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    this.vehicleService.respondToBooking(booking.id, 'Confirmed', amount).subscribe({
      next: (res) => {
        alert('Booking Accepted!');
        this.loadBookingRequests(); // Refresh list
      },
      error: (err) => alert('Error accepting booking')
    });
  }

  declineBooking(booking: any) {
    if (!confirm('Are you sure you want to decline this booking?')) return;

    this.vehicleService.respondToBooking(booking.id, 'Cancelled').subscribe({
      next: (res) => {
        alert('Booking Declined');
        this.loadBookingRequests(); // Refresh list
      },
      error: (err) => alert('Error declining booking')
    });
  }
  // ------------------------------

  addVehicle() {
    const vehicleData = { ...this.newVehicle, ownerId: this.ownerId };
    this.vehicleService.addVehicle(vehicleData).subscribe({
      next: (res) => {
        alert('Vehicle added successfully!');
        this.loadMyVehicles();
        // Reset form but keep location for convenience
        this.newVehicle.registrationNumber = '';
        this.newVehicle.driverName = '';
        this.newVehicle.contactNumber = '';
      },
      error: (err) => {
        console.error('Error adding vehicle', err);
        alert('Failed to add vehicle');
      }
    });
  }

  updateLocation(vehicle: any) {
    if (!vehicle.latitude || !vehicle.longitude) {
      alert('Please enter valid coordinates');
      return;
    }

    this.vehicleService.updateLocation(vehicle.id, vehicle.latitude, vehicle.longitude).subscribe({
      next: (res) => {
        alert(`Location updated for ${vehicle.registrationNumber}`);
      },
      error: (err) => {
        console.error('Error updating location', err);
        alert('Failed to update location');
      }
    });
  }

  getCurrentLocation(target: any) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        target.latitude = position.coords.latitude;
        target.longitude = position.coords.longitude;
      }, (error) => {
        console.error('Error getting location', error);
        alert('Could not get your location. Please check browser permissions.');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  toggleAvailability(vehicle: any) {
    const newStatus = !vehicle.isAvailable;
    this.vehicleService.updateAvailability(vehicle.id, newStatus).subscribe({
      next: (res) => {
        vehicle.isAvailable = newStatus;
        // Optional: show a toast/alert
      },
      error: (err) => console.error('Error updating availability', err)
    });
  }

  deleteVehicle(vehicle: any) {
    if (confirm(`Are you sure you want to remove ${vehicle.registrationNumber}? This cannot be undone.`)) {
      this.vehicleService.deleteVehicle(vehicle.id).subscribe({
        next: (res) => {
          alert('Vehicle removed successfully');
          this.loadMyVehicles();
        },
        error: (err) => {
          console.error('Error deleting vehicle', err);
          alert('Failed to remove vehicle');
        }
      });
    }
  }
}


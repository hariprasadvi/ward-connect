import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { RouterModule } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css']
})
export class OwnerDashboardComponent implements OnInit, AfterViewInit {
  newVehicle = {
    registrationNumber: '',
    type: 'Auto',
    driverName: '',
    contactNumber: '',
    latitude: 10.0,
    longitude: 76.3
  };

  myVehicles: any[] = [];
  ownerId: number | null = null;
  currentUser: any;
  showAddVehicleForm = false;

  // Stats
  activeRidesCount = 0;
  pendingRequestsCount = 0;

  // Map
  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService,
    private toastService: ToastService
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

  ngAfterViewInit(): void {
    this.initMap();
  }

  toggleAddVehicle() {
    this.showAddVehicleForm = !this.showAddVehicleForm;
  }

  // --- Map Logic ---
  initMap(): void {
    // Default to Kerala/Kochi center if no location
    this.map = L.map('dashboard-map').setView([10.0, 76.3], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // If vehicles exist, add markers
    if (this.myVehicles.length > 0) {
      this.updateMapMarkers();
    }
  }

  updateMapMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const bounds = L.latLngBounds([]);

    this.myVehicles.forEach(vehicle => {
      if (vehicle.latitude && vehicle.longitude) {
        const icon = L.icon({
          iconUrl: this.getIconUrl(vehicle.type),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const marker = L.marker([vehicle.latitude, vehicle.longitude], {
          icon: icon,
          draggable: true // Allow dragging to update location
        }).addTo(this.map!);

        marker.bindPopup(`
            <b>${vehicle.type}</b><br>
            ${vehicle.registrationNumber}<br>
            <span style="font-size:10px; color:gray">Drag to update</span>
        `);

        // Handle Drag End -> Update Location
        marker.on('dragend', (event) => {
          const position = marker.getLatLng();
          this.updateLocationFromMap(vehicle, position.lat, position.lng);
        });

        this.markers.push(marker);
        bounds.extend([vehicle.latitude, vehicle.longitude]);
      }
    });

    if (this.myVehicles.length > 0 && bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  getIconUrl(type: string): string {
    const typeLower = type.toLowerCase();
    const iconMap: any = {
      'auto': 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
      'taxi': 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png',
      'ambulance': 'https://cdn-icons-png.flaticon.com/512/2896/2896623.png',
      'jeep': 'https://cdn-icons-png.flaticon.com/512/3097/3097138.png',
      'bus': 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png'
    };
    return iconMap[typeLower] || 'https://cdn-icons-png.flaticon.com/512/741/741407.png';
  }

  focusMapOnVehicle(vehicle: any) {
    if (this.map && vehicle.latitude && vehicle.longitude) {
      this.map.flyTo([vehicle.latitude, vehicle.longitude], 15);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to map
    }
  }

  updateLocationFromMap(vehicle: any, lat: number, lng: number) {
    if (confirm(`Update location for ${vehicle.registrationNumber}?`)) {
      this.vehicleService.updateLocation(vehicle.id, lat, lng).subscribe({
        next: () => {
          this.toastService.show('Location Updated 📍', 'success');
          vehicle.latitude = lat;
          vehicle.longitude = lng;
        },
        error: () => {
          this.toastService.show('Update failed', 'error');
        }
      });
    }
  }
  // --- End Map Logic ---

  loadMyVehicles() {
    if (!this.ownerId) return;
    this.vehicleService.getMyVehicles(this.ownerId).subscribe({
      next: (data) => {
        this.myVehicles = data;
        this.updateMapMarkers();
      },
      error: (err) => console.error('Error loading vehicles', err)
    });
  }

  // --- Booking Requests Logic ---
  bookingRequests: any[] = [];

  loadBookingRequests() {
    if (!this.ownerId) return;
    this.vehicleService.getOwnerRequests(this.ownerId).subscribe({
      next: (data) => {
        this.bookingRequests = data;
        this.calculateStats();
      },
      error: (err) => console.error('Error loading requests', err)
    });

    // Poll every 10 seconds for new requests
    setTimeout(() => this.loadBookingRequests(), 10000);
  }

  calculateStats() {
    this.pendingRequestsCount = this.bookingRequests.filter(r => r.status === 'Pending').length;
    this.activeRidesCount = this.bookingRequests.filter(r => r.status === 'Confirmed').length;
  }

  acceptBooking(booking: any, amountInput: string) {
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) {
      this.toastService.show('Please enter a valid amount', 'warning');
      return;
    }

    this.vehicleService.respondToBooking(booking.id, 'Confirmed', amount).subscribe({
      next: (res) => {
        this.toastService.show('Booking Accepted!', 'success');
        this.loadBookingRequests(); // Refresh list
      },
      error: (err) => this.toastService.show('Error accepting booking', 'error')
    });
  }

  declineBooking(booking: any) {
    if (!confirm('Are you sure you want to decline this booking?')) return;

    this.vehicleService.respondToBooking(booking.id, 'Cancelled').subscribe({
      next: (res) => {
        this.toastService.show('Booking Declined', 'info');
        this.loadBookingRequests(); // Refresh list
      },
      error: (err) => this.toastService.show('Error declining booking', 'error')
    });
  }
  // ------------------------------

  addVehicle() {
    const vehicleData = { ...this.newVehicle, ownerId: this.ownerId };
    this.vehicleService.addVehicle(vehicleData).subscribe({
      next: (res) => {
        this.toastService.show('Vehicle added successfully!', 'success');
        this.showAddVehicleForm = false; // Close form
        this.loadMyVehicles();
        // Reset form but keep location for convenience
        this.newVehicle.registrationNumber = '';
        this.newVehicle.driverName = '';
        this.newVehicle.contactNumber = '';
      },
      error: (err) => {
        console.error('Error adding vehicle', err);
        this.toastService.show('Failed to add vehicle', 'error');
      }
    });
  }

  updateLocation(vehicle: any) {
    if (!vehicle.latitude || !vehicle.longitude) {
      alert('Please enter valid coordinates');
      return;
    }
    this.updateLocationFromMap(vehicle, vehicle.latitude, vehicle.longitude);
  }

  getCurrentLocation(target: any) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        target.latitude = position.coords.latitude;
        target.longitude = position.coords.longitude;
      }, (error) => {
        console.error('Error getting location', error);
        this.toastService.show('Could not get your location. Please check browser permissions.', 'error');
      });
    } else {
      this.toastService.show('Geolocation is not supported by this browser.', 'error');
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
          this.toastService.show('Vehicle removed successfully', 'success');
          this.loadMyVehicles();
        },
        error: (err) => {
          console.error('Error deleting vehicle', err);
          this.toastService.show('Failed to remove vehicle', 'error');
        }
      });
    }
  }

  completeRide(booking: any) {
    if (!confirm('Mark this ride as Completed?')) return;

    this.vehicleService.respondToBooking(booking.id, 'Completed').subscribe({
      next: (res) => {
        this.toastService.show('Ride Completed! 🏁', 'success');
        this.loadBookingRequests();
      },
      error: (err) => this.toastService.show('Error completing ride', 'error')
    });
  }
}


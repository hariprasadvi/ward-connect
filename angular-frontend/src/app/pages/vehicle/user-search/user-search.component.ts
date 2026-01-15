import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { EmergencySosComponent } from '../components/emergency-sos/emergency-sos.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, EmergencySosComponent, FormsModule],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  vehicles: any[] = [];
  markers: L.Marker[] = [];
  isLoading = false;

  // Icons map
  private icons: any = {
    'Auto': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Placeholder (Auto)
      iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
    }),
    'Taxi': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png', // Taxi/Car
      iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
    }),
    'Ambulance': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2983/2983726.png', // Ambulance
      iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
    }),
    'Bus': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Bus
      iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
    }),
    'Jeep': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2361/2361730.png', // Jeep/SUV
      iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
    }),
    'default': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Fallback
      iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
    })
  };

  constructor(private vehicleService: VehicleService) { }

  ngOnInit(): void {
    // Data loading happens here, map init in AfterViewInit
  }

  ngAfterViewInit(): void {
    // Timeout ensuring the container has dimensions
    setTimeout(() => {
      this.initMap();
      this.loadVehicles();
    }, 100);
  }

  private initMap(): void {
    // Default center (e.g., Kerala coordinates or demo location)
    this.map = L.map('map').setView([10.01, 76.31], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Fix tile loading issues
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  loadVehicles(type?: string) {
    this.isLoading = true;
    this.vehicleService.searchVehicles(type).subscribe({
      next: (data) => {
        this.vehicles = data;
        this.updateMapMarkers();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading vehicles', err);
        this.isLoading = false;
      }
    });
  }

  updateMapMarkers() {
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    this.vehicles.forEach(vehicle => {
      if (vehicle.latitude && vehicle.longitude) {
        // Select icon based on type, or default
        const icon = this.icons[vehicle.type] || this.icons['default'];

        const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon: icon })
          .bindPopup(`
            <div style="text-align: center;">
                <b style="font-size: 1.1em; color: #4f46e5;">${vehicle.type}</b><br>
                <div style="font-size: 0.9em; color: #555; margin-bottom: 4px;">${vehicle.registrationNumber}</div>
                <div style="font-size: 0.85em;">Driver: ${vehicle.driverName}</div>
                <button onclick="window.dispatchEvent(new CustomEvent('book-vehicle', {detail: ${vehicle.id}}))" 
                  style="background:#4f46e5; color:white; border:none; padding:6px 12px; border-radius:6px; margin-top:8px; cursor:pointer; width: 100%; font-weight: bold;">
                  Book Ride
                </button>
            </div>
          `);

        marker.addTo(this.map);
        this.markers.push(marker);
      }
    });
  }

  onFilterChange(event: any) {
    const type = event.target.value;
    this.loadVehicles(type);
  }

  flyToVehicle(vehicle: any) {
    if (vehicle.latitude && vehicle.longitude) {
      this.map.flyTo([vehicle.latitude, vehicle.longitude], 16);
    }
  }

  // Booking Modal State
  selectedVehicle: any = null;
  bookingData = {
    source: 'Current Location',
    destination: '',
    bookingTime: ''
  };

  openBookingModal(vehicle: any) {
    this.selectedVehicle = vehicle;
    // Set default time to now + 15 mins
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    this.bookingData.bookingTime = now.toISOString().slice(0, 16);
  }

  closeBookingModal() {
    this.selectedVehicle = null;
  }

  confirmBooking() {
    if (!this.selectedVehicle) return;
    if (!this.bookingData.destination || !this.bookingData.bookingTime) {
      alert('Please fill in all fields');
      return;
    }

    this.vehicleService.bookVehicle({
      userId: 101, // Demo User
      vehicleId: this.selectedVehicle.id,
      source: this.bookingData.source,
      destination: `${this.bookingData.destination} (at ${this.bookingData.bookingTime.replace('T', ' ')})`,
      bookingType: 'Regular'
    }).subscribe({
      next: (res: any) => {
        alert('Request Sent! Waiting for owner to accept...');
        this.pollBookingStatus(res.booking.id);
        this.closeBookingModal();
      },
      error: (err) => alert('Booking Request Failed')
    });
  }

  bookVehicle(vehicle: any) {
    // Replaced by openBookingModal via template
    this.openBookingModal(vehicle);
  }

  pollBookingStatus(bookingId: number) {
    const interval = setInterval(() => {
      this.vehicleService.getBookingStatus(bookingId).subscribe({
        next: (booking) => {
          if (booking.status === 'Confirmed') {
            clearInterval(interval);
            alert(`Ride Confirmed! Amount: ₹${booking.amount}`);
            this.loadVehicles(); // Refresh availability
          } else if (booking.status === 'Cancelled') {
            clearInterval(interval);
            alert('Booking was declined by the owner.');
            this.loadVehicles();
          }
          // If Pending, continue polling
        },
        error: (err) => {
          console.error('Error polling status', err);
          clearInterval(interval);
        }
      });
    }, 3000); // Poll every 3 seconds
  }
}

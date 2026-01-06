import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../../services/vehicle.service';
import { EmergencySosComponent } from '../components/emergency-sos/emergency-sos.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, EmergencySosComponent],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  vehicles: any[] = [];
  markers: L.Marker[] = [];
  isLoading = false;

  // Custom Icon for vehicles
  private vehicleIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Generic car icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

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
        const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon: this.vehicleIcon })
          .bindPopup(`
            <b>${vehicle.type}</b><br>
            Reg: ${vehicle.registrationNumber}<br>
            Driver: ${vehicle.driverName}<br>
            <button onclick="window.dispatchEvent(new CustomEvent('book-vehicle', {detail: ${vehicle.id}}))" 
              style="background:#4f46e5; color:white; border:none; padding:4px 8px; border-radius:4px; margin-top:4px; cursor:pointer;">
              Book Now
            </button>
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

  bookVehicle(vehicle: any) {
    const confirmBook = confirm(`Book ${vehicle.type} (${vehicle.registrationNumber})?`);
    if (confirmBook) {
      this.vehicleService.bookVehicle({
        userId: 101, // Demo User
        vehicleId: vehicle.id,
        source: 'Current Location',
        destination: 'Not Specified',
        bookingType: 'Regular'
      }).subscribe({
        next: (res) => {
          alert('Booking Confirmed! Driver will contact you shortly.');
          this.loadVehicles(); // Refresh to update availability
        },
        error: (err) => alert('Booking Failed')
      });
    }
  }
}

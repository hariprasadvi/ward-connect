import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import * as L from 'leaflet';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  vehicles: any[] = [];
  markers: L.Marker[] = [];
  isLoading = false;
  Infinity = Infinity;

  // Icons map
  icons: any = {
    'auto': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1085/1085961.png', // Auto Rickshaw
      iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
    }),
    'taxi': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png', // Yellow Taxi
      iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
    }),
    'ambulance': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2983/2983726.png', // Ambulance
      iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
    }),
    'bus': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Bus
      iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
    }),
    'jeep': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2361/2361730.png', // Jeep/SUV
      iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
    }),
    'default': L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Default
      iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
    })
  };

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Listen for booking events from map popups
    window.addEventListener('book-vehicle', (event: any) => {
      const vehicleId = event.detail;
      const vehicle = this.vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        this.openBookingModal(vehicle);
      }
    });
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
      this.getUserLocation();
    }, 200);
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.userLat = lat;
        this.userLng = lng;

        // Center map
        this.map.setView([lat, lng], 14);

        // Add 'You are here' marker
        L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png', // User icon
            iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
          })
        }).addTo(this.map).bindPopup("<b>You are here</b>").openPopup();

        // Reload to calc distances
        this.loadVehicles();

      }, (error) => {
        console.error("Error getting location", error);
        // Fallback or alert if needed
      });
    }
  }



  updateMapMarkers() {
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    this.vehicles.forEach(vehicle => {
      if (vehicle.latitude && vehicle.longitude) {
        // Select icon based on type, or default
        const typeKey = vehicle.type ? vehicle.type.toLowerCase() : 'default';
        const icon = this.icons[typeKey] || this.icons['default'];

        const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon: icon })
          .bindPopup(`
            <div class="font-sans min-w-[200px]">
                <div class="flex items-center gap-3 mb-3">
                   <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center p-1.5">
                      <img src="${icon.options.iconUrl}" class="w-full h-full object-contain">
                   </div>
                   <div>
                       <b class="text-lg text-gray-900 block leading-tight">${vehicle.type}</b>
                       <span class="text-xs text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">${vehicle.registrationNumber}</span>
                   </div>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">
                    <span>Driver: <b>${vehicle.driverName}</b></span>
                    <span class="text-yellow-600 font-bold">★ ${vehicle.averageRating ? vehicle.averageRating.toFixed(1) : 'New'}</span>
                </div>

                <button onclick="window.dispatchEvent(new CustomEvent('book-vehicle', {detail: ${vehicle.id}}))" 
                  style="width: 100%; border:none;" 
                  class="bg-black text-white py-2 px-4 rounded-lg text-xs font-bold hover:bg-gray-800 transition shadow-md">
                  Book Ride
                </button>
            </div>
          `);

        marker.addTo(this.map);
        this.markers.push(marker);
      }
    });
  }

  filterType(type: string) {
    this.currentFilter = type;
    this.applyFilters();
  }

  // Filters
  currentFilter = 'All';
  maxDistance = Infinity; // Default to no limit
  allVehicles: any[] = []; // Store full list to filter locally



  setDistance(dist: any) {
    this.maxDistance = dist === 'All' ? Infinity : parseInt(dist);
    this.applyFilters();
  }

  applyFilters() {
    // Start with all vehicles
    let result = this.allVehicles;

    // 1. Filter by Type
    if (this.currentFilter !== 'All') {
      result = result.filter(v => v.type === this.currentFilter);
    }

    // 2. Filter by Distance (if user location is known)
    if (this.userLat && this.userLng && this.maxDistance !== Infinity) {
      result = result.filter(v => {
        if (!v.latitude || !v.longitude) return false;
        const dist = this.vehicleService.calculateDistance(this.userLat!, this.userLng!, v.latitude, v.longitude);
        return dist <= this.maxDistance;
      });
    }

    this.vehicles = result;
    this.updateMapMarkers();
  }

  loadVehicles(type: string = 'All') { // Modified to fetch all and filter locally
    this.isLoading = true;
    this.vehicleService.searchVehicles().subscribe({ // Fetch ALL
      next: (data) => {
        this.allVehicles = data;
        // Calculate distances for sorting/display
        if (this.userLat && this.userLng) {
          this.allVehicles.forEach(v => {
            if (v.latitude && v.longitude) {
              v.distanceKm = this.vehicleService.calculateDistance(this.userLat!, this.userLng!, v.latitude, v.longitude);
            }
          });
          // Sort by distance
          this.allVehicles.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        }

        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading vehicles', err);
        this.isLoading = false;
      }
    });
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
    bookingTime: '',
    estimatedPrice: 0,
    distanceKm: 0
  };

  private routeLine: L.Polyline | null = null;
  userLat: number | null = null;
  userLng: number | null = null;

  openBookingModal(vehicle: any) {
    this.selectedVehicle = vehicle;
    // Set default time to now + 15 mins
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    this.bookingData.bookingTime = now.toISOString().slice(0, 16);

    // Provide Estimate & Draw Route
    if (this.userLat && this.userLng && vehicle.latitude && vehicle.longitude) {
      const dist = this.vehicleService.calculateDistance(this.userLat, this.userLng, vehicle.latitude, vehicle.longitude);
      this.bookingData.distanceKm = dist;
      this.bookingData.estimatedPrice = this.vehicleService.estimatePrice(dist, vehicle.type);

      this.drawRoute(this.userLat, this.userLng, vehicle.latitude, vehicle.longitude);
    }
  }

  drawRoute(lat1: number, lng1: number, lat2: number, lng2: number) {
    if (this.routeLine) {
      this.routeLine.remove();
    }
    const latlngs: [number, number][] = [
      [lat1, lng1],
      [lat2, lng2]
    ];
    this.routeLine = L.polyline(latlngs, { color: 'blue', dashArray: '5, 10', weight: 4 }).addTo(this.map);
    this.map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
  }

  closeBookingModal() {
    this.selectedVehicle = null;
    if (this.routeLine) {
      this.routeLine.remove();
      this.routeLine = null;
    }
  }

  confirmBooking() {
    if (!this.selectedVehicle) return;
    if (!this.bookingData.destination || !this.bookingData.bookingTime) {
      this.toastService.show('Please fill in all fields', 'warning');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.toastService.show('You must be logged in to book a ride.', 'error');
      return;
    }

    this.vehicleService.bookVehicle({
      userId: currentUser.id,
      vehicleId: this.selectedVehicle.id,
      source: this.bookingData.source,
      destination: `${this.bookingData.destination} (at ${this.bookingData.bookingTime.replace('T', ' ')})`,
      bookingType: 'Regular',
      amount: this.bookingData.estimatedPrice // Send the estimated price to the owner
    }).subscribe({
      next: (res: any) => {
        this.toastService.show('Request Sent! Waiting for owner to accept...', 'info');
        this.pollBookingStatus(res.booking.id);
        this.closeBookingModal();
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Booking Request Failed: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  bookVehicle(vehicle: any) {
    // Replaced by openBookingModal via template
    this.openBookingModal(vehicle);
  }

  // Geocoding & Debounce
  private searchTimeout: any;
  locationSuggestions: any[] = [];
  showSuggestions = false;

  onDestinationChange() {
    clearTimeout(this.searchTimeout);
    this.locationSuggestions = [];
    this.showSuggestions = false;

    if (!this.bookingData.destination || this.bookingData.destination.length < 3) return;

    this.searchTimeout = setTimeout(() => {
      this.geocodeAddress(this.bookingData.destination);
    }, 700);
  }

  geocodeAddress(query: string) {
    // Restrict to India (countrycodes=in) and add viewbox for Kerala region for priority
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          this.locationSuggestions = data;
          this.showSuggestions = true;
        } else {
          this.locationSuggestions = [];
          this.showSuggestions = false;
        }
      })
      .catch(err => console.error('Geocoding error:', err));
  }

  selectSuggestion(suggestion: any) {
    const destLat = parseFloat(suggestion.lat);
    const destLng = parseFloat(suggestion.lon);
    // Use a shorter display name
    this.bookingData.destination = suggestion.display_name.split(',').slice(0, 3).join(', ');
    this.locationSuggestions = [];
    this.showSuggestions = false;
    this.updateRouteAndPrice(destLat, destLng);
  }

  updateRouteAndPrice(destLat: number, destLng: number) {
    if (this.userLat && this.userLng && this.selectedVehicle) {
      // 1. Calculate distance: Vehicle -> User
      const distVehicleToUser = this.vehicleService.calculateDistance(this.selectedVehicle.latitude, this.selectedVehicle.longitude, this.userLat, this.userLng);

      // 2. Calculate distance: User -> Destination
      const distUserToDest = this.vehicleService.calculateDistance(this.userLat, this.userLng, destLat, destLng);

      // 3. Total Distance
      const totalDistance = distVehicleToUser + distUserToDest;
      this.bookingData.distanceKm = parseFloat(totalDistance.toFixed(2));

      // 4. Estimate Price based on Total Distance
      this.bookingData.estimatedPrice = this.vehicleService.estimatePrice(totalDistance, this.selectedVehicle.type);

      // 5. Draw Route: User -> Destination
      this.drawRoute(this.userLat, this.userLng, destLat, destLng);
    }
  }

  pollBookingStatus(bookingId: number) {
    const interval = setInterval(() => {
      this.vehicleService.getBookingStatus(bookingId).subscribe({
        next: (booking) => {
          if (booking.status === 'Confirmed') {
            clearInterval(interval);
            const driverInfo = booking.Vehicle ? `. Driver: ${booking.Vehicle.driverName} (${booking.Vehicle.contactNumber})` : '';
            this.toastService.show(`Ride Confirmed! Amount: ₹${booking.amount}${driverInfo}`, 'success');
            this.loadVehicles(); // Refresh availability
          } else if (booking.status === 'Cancelled') {
            clearInterval(interval);
            this.toastService.show('Booking was declined by the owner.', 'error');
            this.loadVehicles();
          } else if (booking.status === 'Timeout') {
            clearInterval(interval);
            if (confirm('The driver did not accept the request in time. Would you like to try requesting again?')) {
              this.confirmBooking();
            } else {
              this.loadVehicles();
            }
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    private apiUrl = 'http://localhost:5000/api/vehicle'; // Adjust port if needed

    constructor(private http: HttpClient) { }

    // Owner APIs
    addVehicle(vehicleData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/add`, vehicleData);
    }

    getMyVehicles(ownerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/my-vehicles/${ownerId}`);
    }

    updateAvailability(vehicleId: number, isAvailable: boolean): Observable<any> {
        return this.http.put(`${this.apiUrl}/${vehicleId}/availability`, { isAvailable });
    }

    deleteVehicle(vehicleId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/delete/${vehicleId}`);
    }

    // User APIs
    searchVehicles(type?: string): Observable<any[]> {
        let url = `${this.apiUrl}/search`;
        if (type) {
            url += `?type=${type}`;
        }
        return this.http.get<any[]>(url);
    }

    bookVehicle(bookingData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/book`, bookingData);
    }

    emergencySos(data: { userId: number, latitude: number, longitude: number }): Observable<any> {
        return this.http.post(`${this.apiUrl}/emergency`, data);
    }

    updateLocation(vehicleId: number, latitude: number, longitude: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/update-location/${vehicleId}`, { latitude, longitude });
    }

    getOwnerRequests(ownerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/requests/${ownerId}`);
    }

    respondToBooking(bookingId: number, status: string, amount?: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/respond`, { bookingId, status, amount });
    }

    getBookingStatus(bookingId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/booking/${bookingId}`);
    }

    getUserHistory(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/history/user/${userId}`);
    }



    getOwnerHistory(ownerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/history/owner/${ownerId}`);
    }

    // --- Helper Methods for Price Estimation ---

    rateVehicle(bookingId: number, rating: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/rate`, { bookingId, rating });
    }

    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return parseFloat(d.toFixed(2));
    }

    deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    estimatePrice(distanceKm: number, vehicleType: string): number {
        let baseRate = 0;
        let perKmRate = 0;

        switch (vehicleType.toLowerCase()) {
            case 'auto':
                baseRate = 25;
                perKmRate = 15;
                break;
            case 'taxi':
                baseRate = 50;
                perKmRate = 20;
                break;
            case 'ambulance':
                baseRate = 500;
                perKmRate = 30;
                break;
            case 'jeep':
                baseRate = 60;
                perKmRate = 18;
                break;
            default: // Bus or others
                baseRate = 10; // Min ticket (simulated)
                perKmRate = 5;
        }

        const totalor = baseRate + (distanceKm * perKmRate);
        return Math.ceil(totalor);
    }
}

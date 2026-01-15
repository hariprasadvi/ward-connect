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
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HealthService {
    http = inject(HttpClient);
    private apiUrl = 'http://localhost:5000/api/health';

    // --- Donation Requests ---
    getDonationRequests(filters?: any): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/donations`, { params: filters });
    }

    createDonationRequest(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/donations`, data);
    }

    getMyDonationRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/donations/my`);
    }

    // --- Medicine Reminders ---
    getMedicineReminders(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/medicines`);
    }

    addMedicineReminder(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/medicines`, data);
    }

    deleteMedicineReminder(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/medicines/${id}`);
    }

    // --- Health Records ---
    getHealthRecords(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/records`);
    }

    addHealthRecord(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/records`, data);
    }
}

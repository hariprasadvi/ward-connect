import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class JobService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    chat(message: string, history: any[] = []): Observable<any> {
        return this.http.post(`${this.apiUrl}/chat`, { message, history });
    }

    generateCV(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/generate-cv`, data);
    }

    getJobs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/jobs`);
    }

    applyJob(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/apply`, data);
    }

    subscribeToAlerts(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/subscribe`, { email });
    }
}

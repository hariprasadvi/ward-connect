import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class JobService {
    private apiUrl = 'http://localhost:5000/api/job';

    constructor(private http: HttpClient) { }

    sendChatMessage(history: any[], message: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/chat`, { history, message });
    }

    generateCV(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/cv`, userData);
    }

    getJobAlerts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/alerts`);
    }
}

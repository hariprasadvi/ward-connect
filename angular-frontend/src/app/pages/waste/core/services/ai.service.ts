import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AIClassificationResponse {
  category: string;
  confidence: number;
  tips: string;
  analysis: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://localhost:5000/api/waste/ai';

  constructor(private http: HttpClient) {}

  classifyWaste(description: string): Observable<AIClassificationResponse> {
    return this.http.post<AIClassificationResponse>(`${this.apiUrl}/classify`, { description });
  }
}





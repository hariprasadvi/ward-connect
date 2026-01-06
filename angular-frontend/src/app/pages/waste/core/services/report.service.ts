import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { delay, map } from 'rxjs/operators';

export interface ReportData {
  pickupStats: {
    total: number;
    regular: number;
    bulk: number;
    completed: number;
    pending: number;
  };
  complaintStats: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
  monthlyData: {
    month: string;
    pickups: number;
    complaints: number;
  }[];
  categoryData: {
    category: string;
    count: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  generateReport(): Observable<ReportData> {
    // Generate mock report data
    return of(null).pipe(
      delay(800),
      map(() => ({
        pickupStats: {
          total: 156,
          regular: 120,
          bulk: 36,
          completed: 140,
          pending: 16
        },
        complaintStats: {
          total: 45,
          pending: 8,
          inProgress: 12,
          resolved: 25
        },
        monthlyData: [
          { month: 'Jan', pickups: 48, complaints: 12 },
          { month: 'Feb', pickups: 52, complaints: 8 },
          { month: 'Mar', pickups: 58, complaints: 15 },
          { month: 'Apr', pickups: 62, complaints: 10 },
          { month: 'May', pickups: 55, complaints: 7 },
          { month: 'Jun', pickups: 60, complaints: 9 }
        ],
        categoryData: [
          { category: 'Missed Pickup', count: 18 },
          { category: 'Improper Collection', count: 12 },
          { category: 'Littering', count: 8 },
          { category: 'Illegal Dumping', count: 5 },
          { category: 'Other', count: 2 }
        ]
      }))
    );
  }

  exportReport(format: 'pdf' | 'excel'): Observable<boolean> {
    // Simulate export operation
    return of(true).pipe(delay(1000));
  }
}





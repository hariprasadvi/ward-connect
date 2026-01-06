import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { 
  PickupRequest, 
  PickupType, 
  PickupStatus, 
  SchedulePickupData, 
  BulkPickupData,
  AdminSchedulePickupData
} from '../models/pickup.model';
import { environment } from '../../../environments/environment';

export const HOUSE_NUMBERS = Array.from({length: 20}, (_, i) => (i + 1).toString());

@Injectable({
  providedIn: 'root'
})
export class PickupService {
  private pickupsSubject = new BehaviorSubject<PickupRequest[]>([]);
  public pickups$ = this.pickupsSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/pickups`;

  constructor(private http: HttpClient) {}

  scheduleAdminPickup(data: AdminSchedulePickupData): Observable<PickupRequest> {
    return this.http.post<PickupRequest>(this.apiUrl, {
      ...data,
      type: PickupType.REGULAR,
      isAdminScheduled: true
    }).pipe(
      map(pickup => {
        // Refresh local state if needed or append
        const current = this.pickupsSubject.value;
        this.pickupsSubject.next([...current, pickup]);
        return pickup;
      })
    );
  }

  getPickupsByHouseNumber(houseNumber: string): Observable<PickupRequest[]> {
     return this.getAllPickups().pipe(
       map(pickups => pickups.filter(p => p.houseNumbers && p.houseNumbers.includes(houseNumber)))
     );
  }

  getAvailableHouseNumbers(): Observable<string[]> {
    // This could also be an API call if house numbers are dynamic
    return new Observable(observer => {
      observer.next(HOUSE_NUMBERS);
      observer.complete();
    });
  }

  schedulePickup(userId: string, userName: string, data: SchedulePickupData): Observable<PickupRequest> {
    return this.http.post<PickupRequest>(this.apiUrl, {
      ...data,
      type: PickupType.REGULAR
    }).pipe(
      map(pickup => {
        const current = this.pickupsSubject.value;
        this.pickupsSubject.next([...current, pickup]);
        return pickup;
      })
    );
  }

  scheduleBulkPickup(userId: string, userName: string, data: BulkPickupData): Observable<PickupRequest> {
    return this.http.post<PickupRequest>(this.apiUrl, {
      ...data,
      type: PickupType.BULK
    }).pipe(
      map(pickup => {
        const current = this.pickupsSubject.value;
        this.pickupsSubject.next([...current, pickup]);
        return pickup;
      })
    );
  }

  getUserPickups(userId: string): Observable<PickupRequest[]> {
    // Backend filters by internal token userId usually, but if admin views user pickups, might need param
    // For now assuming get all returns all for admin, and user's for user.
    return this.http.get<PickupRequest[]>(this.apiUrl).pipe(
      map(pickups => {
        this.pickupsSubject.next(pickups);
        return pickups;
      })
    );
  }

  getAllPickups(): Observable<PickupRequest[]> {
    return this.http.get<PickupRequest[]>(this.apiUrl).pipe(
       map(pickups => {
        this.pickupsSubject.next(pickups);
        return pickups;
      })
    );
  }

  getPickupById(id: string): Observable<PickupRequest | undefined> {
    // Assuming backend endpoint /:id exists or filter from list
    // I didn't create /:id GET endpoint, so I'll filter from getAll
    return this.getAllPickups().pipe(
      map(pickups => pickups.find(p => p.id.toString() === id.toString()))
    );
  }

  confirmPickup(id: string): Observable<PickupRequest> {
    return this.updatePickupStatus(id, PickupStatus.CONFIRMED);
  }

  assignVehicle(id: string, vehicleNumber: string): Observable<PickupRequest> {
    return this.http.put<PickupRequest>(`${this.apiUrl}/${id}`, {
      status: PickupStatus.CONFIRMED,
      assignedVehicle: vehicleNumber
    });
  }

  updatePickupStatus(id: string, status: PickupStatus): Observable<PickupRequest> {
    return this.http.put<PickupRequest>(`${this.apiUrl}/${id}`, { status });
  }

  cancelPickup(id: string): Observable<PickupRequest> {
    return this.updatePickupStatus(id, PickupStatus.CANCELLED);
  }
}

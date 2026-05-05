import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private http = inject(HttpClient);
  private swPush = inject(SwPush);
  private VAPID_PUBLIC_KEY = environment.vapidPublicKey;
  private apiUrl = `${environment.apiUrl}/api/push`;

  constructor() {}

  requestSubscription() {
    if (!this.swPush.isEnabled) {
      alert('Service Worker is not enabled or supported by this browser.');
      return;
    }

    if (!this.VAPID_PUBLIC_KEY) {
      alert('VAPID_PUBLIC_KEY is undefined!');
      return;
    }

    setTimeout(() => {
      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      }).then(subscription => {
      this.sendSubscriptionToServer(subscription).subscribe({
         next: () => alert('Successfully subscribed to push notifications on backend.'),
         error: (err) => console.error('Error saving subscription on server: ', err)
      });
    }).catch(err => console.error('Could not subscribe to push notifications (using fallback alarm instead). Error:', err));
    }, 2000); // 2 second delay to ensure SW is ready
  }

  private sendSubscriptionToServer(subscription: PushSubscription): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, subscription);
  }
}

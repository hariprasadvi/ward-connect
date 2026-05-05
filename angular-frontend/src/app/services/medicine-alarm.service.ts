import { Injectable, inject } from '@angular/core';
import { HealthService } from './health.service';

@Injectable({
  providedIn: 'root'
})
export class MedicineAlarmService {
  private healthService = inject(HealthService);
  private medicines: any[] = [];
  private intervalId: any;
  private hasStarted = false;

  private alarmAudio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

  start() {
    if (this.hasStarted) return;
    this.hasStarted = true;
    
    // Load initially
    this.loadMedicines();

    // Reload every 10 minutes to grab new ones
    setInterval(() => this.loadMedicines(), 10 * 60 * 1000);

    // Check every 10 seconds if it's time
    this.intervalId = setInterval(() => {
      this.checkAlarms();
    }, 10000);
  }

  public reload() {
    this.loadMedicines();
  }

  private loadMedicines() {
    this.healthService.getMedicineReminders().subscribe({
      next: (data) => {
        this.medicines = data;
      },
      error: (err) => console.error('Error fetching medicines for alarm', err)
    });
  }

  private checkAlarms() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeString = `${hours}:${minutes}`;

    this.medicines.forEach(med => {
      if (!med.isActive) return;

      let times = med.scheduledTimes || [];
      if (typeof times === 'string') {
        try { times = JSON.parse(times); } catch(e) {}
      }

      if (times.includes(currentTimeString)) {
        // We only want to alert once per scheduled minute to prevent spamming exactly every 10 seconds.
        // We track 'lastAlerted' on the object
        const alertKey = `${new Date().toDateString()}-${currentTimeString}`;
        if (med._lastAlerted !== alertKey) {
          med._lastAlerted = alertKey;
          this.triggerAlarm(med);
        }
      }
    });
  }

  private triggerAlarm(med: any) {
    this.alarmAudio.loop = true;
    console.log('[MedicineAlarm] Playing alarm sound...');
    this.alarmAudio.play().catch(e => {
      console.error('[MedicineAlarm] Audio play failed or blocked by browser:', e);
      // We still show the overlay even if audio fails
    });

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(14, 165, 233, 0.95)';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'sans-serif';

    const title = document.createElement('h1');
    title.innerText = '🕒 IT IS TIME FOR YOUR MEDICINE!';
    title.style.fontSize = '3rem';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';

    const desc = document.createElement('p');
    desc.innerText = `${med.medicineName} - ${med.dosage || 'Prescribed dose'}`;
    desc.style.fontSize = '2rem';
    desc.style.marginBottom = '40px';

    const btn = document.createElement('button');
    btn.innerText = 'DISMISS ALARM';
    btn.style.padding = '20px 40px';
    btn.style.fontSize = '1.5rem';
    btn.style.fontWeight = 'bold';
    btn.style.backgroundColor = 'white';
    btn.style.color = '#0ea5e9';
    btn.style.border = 'none';
    btn.style.borderRadius = '12px';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';

    btn.onclick = () => {
      this.alarmAudio.pause();
      this.alarmAudio.currentTime = 0;
      document.body.removeChild(overlay);
    };

    overlay.appendChild(title);
    overlay.appendChild(desc);
    overlay.appendChild(btn);

    document.body.appendChild(overlay);
  }
}

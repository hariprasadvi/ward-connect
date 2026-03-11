import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { HealthService } from '../../../services/health.service';

@Component({
  selector: 'app-medicine-reminder',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6">
          <div>
            <h1 class="text-4xl font-extrabold mb-2 text-slate-900 tracking-tight">Medicine Schedule</h1>
            <p class="text-slate-500 font-medium">Never miss a dose again. Stay healthy, stay on track.</p>
          </div>
          <button (click)="showAddForm = !showAddForm" 
                  class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  [class.bg-rose-500]="showAddForm"
                  [class.bg-sky-500]="!showAddForm">
            <mat-icon>{{showAddForm ? 'close' : 'add'}}</mat-icon> {{showAddForm ? 'Cancel' : 'Add Medication'}}
          </button>
        </div>

        <!-- Add Medicine Form -->
        <div *ngIf="showAddForm" class="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl mb-10 animate-fade-in-down">
          <h3 class="font-bold text-xl mb-6 flex items-center gap-2 text-sky-600">
             <mat-icon>medication</mat-icon> Add New Presciption
          </h3>
          <form (ngSubmit)="addMedicine()" class="flex flex-col gap-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="lg:col-span-2">
                <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Medicine Name</label>
                <input type="text" [(ngModel)]="newMedicine.name" name="name" required
                       class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-sky-500 transition-all font-semibold" placeholder="e.g. Amoxicillin">
              </div>
              <div class="lg:col-span-1">
                <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Dosage</label>
                <input type="text" [(ngModel)]="newMedicine.dose" name="dose" required
                       class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-sky-500 transition-all font-semibold" placeholder="e.g. 500mg">
              </div>
              <div class="lg:col-span-1">
                <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</label>
                <input type="time" [(ngModel)]="newMedicine.time" name="time" required
                       class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-sky-500 transition-all font-semibold cursor-pointer">
              </div>
              <div class="lg:col-span-4">
                 <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Instructions</label>
                 <input type="text" [(ngModel)]="newMedicine.instructions" name="instr"
                        class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-sky-500 transition-all font-medium" placeholder="Additional notes (e.g. After food)">
              </div>
            </div>
            <div class="flex justify-end">
                <button type="submit" [disabled]="!newMedicine.name || !newMedicine.dose || !newMedicine.time"
                        class="bg-sky-500 text-white py-3 px-8 rounded-xl font-bold shadow-lg shadow-sky-500/30 hover:bg-sky-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Save Schedule
                </button>
            </div>
          </form>
        </div>

        <div class="grid gap-5">
          <div *ngFor="let med of medicines" 
               class="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center justify-between overflow-hidden"
               [class.opacity-60]="med.taken">
            
            <!-- Status Indicator Line -->
            <div class="absolute left-0 top-0 bottom-0 w-2 transition-colors" [class.bg-emerald-400]="med.taken" [class.bg-sky-400]="!med.taken"></div>

            <div class="flex items-center gap-6 pl-4">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors"
                   [class.bg-emerald-100]="med.taken" [class.text-emerald-600]="med.taken"
                   [class.bg-sky-100]="!med.taken" [class.text-sky-600]="!med.taken">
                <mat-icon style="font-size: 32px; width: 32px; height: 32px;">{{med.taken ? 'check_circle' : 'schedule'}}</mat-icon>
              </div>
              <div>
                <h3 class="text-xl font-bold m-0 text-slate-800"
                    [class.line-through]="med.taken"
                    [class.text-slate-400]="med.taken">{{med.name}}</h3>
                <div class="flex flex-wrap items-center gap-3 text-slate-500 text-sm font-medium mt-1">
                  <span class="flex items-center gap-1"><mat-icon class="text-base w-4 h-4">access_time</mat-icon> {{med.time}}</span>
                  <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{{med.dose}}</span>
                  <span *ngIf="med.frequency" class="bg-slate-100 px-2 py-0.5 rounded text-xs">{{med.frequency}}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button (click)="deleteMedicine(med.id)" class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                  <mat-icon>delete</mat-icon>
              </button>
              <button (click)="toggleTaken(med.id)"
                      class="w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2"
                      [class.bg-emerald-500]="med.taken" [class.border-emerald-500]="med.taken" [class.text-white]="med.taken"
                      [class.bg-white]="!med.taken" [class.border-slate-200]="!med.taken" [class.text-slate-400]="!med.taken"
                      [class.hover:border-emerald-400]="!med.taken" [class.hover:text-emerald-400]="!med.taken">
                  <mat-icon>{{med.taken ? 'done' : 'check'}}</mat-icon>
              </button>
            </div>
          </div>

          <div *ngIf="medicines.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-200">
            <mat-icon style="font-size: 64px; width: 64px; height: 64px;" class="mb-4 text-slate-200">medication_liquid</mat-icon>
            <p class="font-medium text-lg">No medicines scheduled for today.</p>
            <button (click)="showAddForm = true" class="text-sky-500 font-bold mt-2 hover:underline">Add your first medicine</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-down { animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class MedicineReminderComponent implements OnInit {
  healthService = inject(HealthService);

  medicines: any[] = [];
  showAddForm = false;
  newMedicine = { name: '', dose: '', time: '', instructions: '' };

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.healthService.getMedicineReminders().subscribe({
      next: (data) => {
        // Map backend data to frontend model if necessary
        this.medicines = data.map(m => ({
          id: m.id,
          name: m.medicineName,
          dose: m.dosage || m.dose,
          time: m.scheduledTimes ? m.scheduledTimes[0] : '09:00', // Assuming simple single time for this UI
          taken: false, // Status logic would need backend support for 'daily logs', skipping for simple demo
          frequency: m.frequency
        }));
      },
      error: (err) => console.error('Error fetching medicines', err)
    });
  }

  toggleTaken(id: string) {
    // Just local toggle for UI demo as backend doesn't track daily adherence logs yet
    this.medicines = this.medicines.map(m =>
      m.id === id ? { ...m, taken: !m.taken } : m
    );
  }

  addMedicine() {
    if (this.newMedicine.name && this.newMedicine.dose && this.newMedicine.time) {
      const payload = {
        medicineName: this.newMedicine.name,
        dosage: this.newMedicine.dose,
        frequency: 'Daily', // Default for now
        scheduledTimes: [this.newMedicine.time],
        startDate: new Date().toISOString().split('T')[0],
        instructions: this.newMedicine.instructions
      };

      this.healthService.addMedicineReminder(payload).subscribe({
        next: (res) => {
          // Optimistic update
          this.medicines.unshift({
            id: res.id,
            name: res.medicineName,
            dose: res.dosage,
            time: res.scheduledTimes[0],
            taken: false
          });
          this.newMedicine = { name: '', dose: '', time: '', instructions: '' };
          this.showAddForm = false;
        },
        error: (err) => alert('Failed to add medicine')
      });
    }
  }

  deleteMedicine(id: string) {
    this.healthService.deleteMedicineReminder(id).subscribe({
      next: () => {
        this.medicines = this.medicines.filter(m => m.id !== id);
      },
      error: (err) => alert('Failed to delete')
    });
  }
}

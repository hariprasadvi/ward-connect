import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-medicine-reminder',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">Medicine Schedule</h1>
          <p class="text-gray-500">Keep track of your daily intake.</p>
        </div>
        <button (click)="showAddForm = !showAddForm" 
                class="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:translate-y-[-2px] transition-all text-white"
                [style.background]="showAddForm ? '#ef4444' : 'linear-gradient(to right, #0ea5e9, #6366f1)'">
          <mat-icon>{{showAddForm ? 'close' : 'add'}}</mat-icon> {{showAddForm ? 'Cancel' : 'Add Medicine'}}
        </button>
      </div>

      <!-- Add Medicine Form -->
      <div *ngIf="showAddForm" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-md mb-8 animate-fade-in">
        <h3 class="font-bold text-lg mb-4">Add New Medicine</h3>
        <form (ngSubmit)="addMedicine()" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">Medicine Name</label>
              <input type="text" [(ngModel)]="newMedicine.name" name="name" required
                     class="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500/50 outline-none" placeholder="e.g. Asprin">
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">Dose</label>
              <input type="text" [(ngModel)]="newMedicine.dose" name="dose" required
                     class="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500/50 outline-none" placeholder="e.g. 500mg">
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">Time</label>
              <input type="time" [(ngModel)]="newMedicine.time" name="time" required
                     class="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500/50 outline-none">
            </div>
          </div>
          <button type="submit" [disabled]="!newMedicine.name || !newMedicine.dose || !newMedicine.time"
                  class="mt-2 bg-indigo-600 text-white py-2 px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Save Schedule
          </button>
        </form>
      </div>

      <div class="grid gap-4">
        <div *ngFor="let med of medicines" 
             class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all"
             [style.border-left]="'6px solid ' + (med.taken ? 'var(--secondary)' : 'var(--primary)')"
             [class.opacity-70]="med.taken">
          
          <div class="flex items-center gap-6">
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50"
                 [style.color]="med.taken ? 'var(--secondary)' : 'var(--primary)'"
                 [style.background-color]="med.taken ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 165, 233, 0.1)'">
              <mat-icon>medication</mat-icon>
            </div>
            <div>
              <h3 class="text-xl font-bold m-0"
                  [style.text-decoration]="med.taken ? 'line-through' : 'none'"
                  [class.text-gray-400]="med.taken">{{med.name}}</h3>
              <div class="flex items-center gap-2 text-gray-500 mt-1">
                <mat-icon class="text-sm w-4 h-4 flex items-center">schedule</mat-icon> <span>{{med.time}}</span>
                <span class="w-1 h-1 bg-current rounded-full"></span>
                <span>{{med.dose}}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="deleteMedicine(med.id)" class="text-gray-400 hover:text-red-500 transition-colors p-2">
                <mat-icon>delete</mat-icon>
            </button>
            <button (click)="toggleTaken(med.id)"
                    class="w-12 h-12 rounded-full flex items-center justify-center transition-all border-2"
                    [style.background]="med.taken ? 'var(--secondary)' : 'transparent'"
                    [style.border-color]="med.taken ? 'var(--secondary)' : '#e2e8f0'"
                    [style.color]="med.taken ? 'white' : '#64748b'">
                <mat-icon>check_circle</mat-icon>
            </button>
          </div>
        </div>

        <div *ngIf="medicines.length === 0" class="text-center p-16 text-gray-500">
          No medicines scheduled.
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0ea5e9;
      --secondary: #6366f1;
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class MedicineReminderComponent {
  medicines = [
    { id: 1, name: 'Amoxicillin', dose: '500mg', time: '08:00', taken: false },
    { id: 2, name: 'Vitamin D', dose: '1000IU', time: '09:00', taken: true },
    { id: 3, name: 'Paracetamol', dose: '500mg', time: '20:00', taken: false },
  ];

  showAddForm = false;
  newMedicine = { name: '', dose: '', time: '' };

  toggleTaken(id: number) {
    this.medicines = this.medicines.map(m =>
      m.id === id ? { ...m, taken: !m.taken } : m
    );
  }

  addMedicine() {
    if (this.newMedicine.name && this.newMedicine.dose && this.newMedicine.time) {
      this.medicines.push({
        id: Date.now(),
        ...this.newMedicine,
        taken: false
      });
      this.newMedicine = { name: '', dose: '', time: '' }; // Reset form
      this.showAddForm = false; // Close form
    }
  }

  deleteMedicine(id: number) {
    this.medicines = this.medicines.filter(m => m.id !== id);
  }
}

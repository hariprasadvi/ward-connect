import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-insurance-checker',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold mb-2">Scheme Eligibility Checker</h1>
        <p class="text-gray-500">Find Government and Private health schemes relevant to you.</p>
        
        <button *ngIf="isHealthWorker" (click)="showAddSchemeForm = !showAddSchemeForm" 
                class="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold shadow-sm hover:bg-indigo-700 transition flex items-center gap-2 mx-auto">
            <mat-icon>add</mat-icon> Add New Scheme
        </button>
      </div>

       <!-- Health Worker Add Scheme Form -->
       <div *ngIf="isHealthWorker && showAddSchemeForm" class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 max-w-3xl mx-auto">
        <h3 class="font-bold text-lg mb-4 text-indigo-900">Add New Health Scheme</h3>
        <form (ngSubmit)="addScheme()" class="flex flex-col gap-4">
            <div>
              <label class="block mb-1 font-medium text-sm text-indigo-800">Scheme Name</label>
              <input type="text" [(ngModel)]="newScheme.name" name="name" required class="w-full p-2 rounded-lg border-indigo-200">
            </div>
             <div class="grid grid-cols-2 gap-4">
                <div>
                   <label class="block mb-1 font-medium text-sm text-indigo-800">Coverage Amount</label>
                   <input type="text" [(ngModel)]="newScheme.cover" name="cover" required class="w-full p-2 rounded-lg border-indigo-200" placeholder="e.g. 5 Lakhs">
                </div>
            </div>
            <div>
               <label class="block mb-1 font-medium text-sm text-indigo-800">Requirements / Eligibility Criteria</label>
               <textarea [(ngModel)]="newScheme.requirements" name="reqs" required class="w-full p-2 rounded-lg border-indigo-200" rows="3" placeholder="e.g. Annual income must be below 3 Lakhs..."></textarea>
            </div>
            <div>
              <label class="block mb-1 font-medium text-sm text-indigo-800">Description</label>
              <textarea [(ngModel)]="newScheme.desc" name="desc" required class="w-full p-2 rounded-lg border-indigo-200" rows="2"></textarea>
            </div>
            <button type="submit" class="bg-indigo-600 text-white py-2 px-6 rounded-lg font-bold hover:bg-indigo-700 self-end">
                Publish Scheme
            </button>
        </form>
       </div>

      <!-- Citizen Checker View (Hidden for Health Workers) -->
      <div *ngIf="!isHealthWorker" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Form Section -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
            <mat-icon class="text-sky-500">info</mat-icon> Your Profile
          </h3>
          <form (ngSubmit)="checkEligibility()" class="flex flex-col gap-4">
            <div>
              <label class="block mb-1.5 font-medium">Age</label>
              <input type="number" placeholder="e.g. 30" required 
                     class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500/20 outline-none">
            </div>
            <div>
              <label class="block mb-1.5 font-medium">Annual Income</label>
              <input type="number" placeholder="₹" required 
                     class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500/20 outline-none">
            </div>
            <div>
              <label class="block mb-1.5 font-medium">Employment Type</label>
              <select class="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-sky-500/20 outline-none">
                <option>Private Sector</option>
                <option>Government</option>
                <option>Self Employed</option>
                <option>Unemployed</option>
                <option>Student</option>
              </select>
            </div>
            <div>
              <label class="block mb-1.5 font-medium">State of Residence</label>
              <select class="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-sky-500/20 outline-none">
                <option>Kerala</option>
                <option>Delhi</option>
                <option>Maharashtra</option>
                <option>Karnataka</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" 
                    class="mt-4 w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all">
              Check Eligibility
            </button>
          </form>
        </div>

        <!-- Results Section -->
        <div>
          <div *ngIf="result; else emptyState" class="flex flex-col gap-4">
            <h3 class="font-bold text-lg mb-2">Results</h3>
            <div *ngFor="let item of result" 
                 class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 transition-all"
                 [style.border-left-color]="item.eligible ? 'var(--secondary)' : '#94a3b8'">
              
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-bold text-lg m-0" [class.text-gray-400]="!item.eligible">{{item.name}}</h4>
                <mat-icon [class.text-indigo-500]="item.eligible" [class.text-gray-400]="!item.eligible">
                  {{item.eligible ? 'check_circle' : 'cancel'}}
                </mat-icon>
              </div>
              
              <p class="text-gray-500 text-sm mb-3">{{item.desc}}</p>

              <div *ngIf="item.eligible" 
                   class="inline-flex items-center gap-2 bg-green-50 text-indigo-600 px-3 py-1 rounded-lg text-sm font-semibold">
                <mat-icon class="text-sm w-4 h-4 flex items-center">verified_user</mat-icon> 
                Coverage: {{item.cover}}
              </div>

              <div *ngIf="!item.eligible" class="text-sm text-rose-500 italic">
                Reason: {{item.reason}}
              </div>
            </div>
          </div>

          <ng-template #emptyState>
             <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center p-12 text-gray-400 min-h-[400px]">
                <mat-icon style="font-size: 64px; width: 64px; height: 64px; margin-bottom: 1rem; opacity: 0.2">description</mat-icon>
                <p class="text-lg">Fill the form to see eligible Government and Private health schemes.</p>
             </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0ea5e9;
      --secondary: #6366f1;
    }
  `]
})
export class InsuranceCheckerComponent {
  authService = inject(AuthService);

  result: any[] | null = null;

  showAddSchemeForm = false;
  newScheme = { name: '', cover: '', requirements: '', desc: '' };

  get isHealthWorker(): boolean {
    return this.authService.hasRole('Health Worker');
  }

  checkEligibility() {
    // Mock logic for demo
    this.result = [
      { name: 'Pradhan Mantri Jan Arogya Yojana', eligible: true, cover: '5 Lakhs', desc: 'Comprehensive coverage for secondary and tertiary care hospitalization.' },
      { name: 'Employees State Insurance', eligible: false, reason: 'Salary exceeds threshold', desc: 'Social security and health insurance for employees.' },
      { name: 'Senior Citizen Health Insurance', eligible: false, reason: 'Age must be > 60', desc: 'Specialized care for senior citizens.' },
      { name: 'Karunya Health Scheme', eligible: true, cover: '2 Lakhs', desc: 'Critical illness coverage for BPL families in Kerala.' },
    ];
  }

  addScheme() {
    if (!this.result) this.result = [];
    this.result.unshift({
      name: this.newScheme.name,
      cover: this.newScheme.cover,
      eligible: true, // Auto visible
      desc: this.newScheme.desc + (this.newScheme.requirements ? ` (Req: ${this.newScheme.requirements})` : '')
    });
    this.newScheme = { name: '', cover: '', requirements: '', desc: '' }; // Reset
    this.showAddSchemeForm = false;

    if (!this.result || this.result.length === 1) this.checkEligibility();
  }
}

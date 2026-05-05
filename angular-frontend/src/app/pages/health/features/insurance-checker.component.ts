import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HealthService } from '../../../services/health.service';
import { ToastService } from '../../../services/toast.service';

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
                   <input type="text" [(ngModel)]="newScheme.coverAmount" name="cover" required class="w-full p-2 rounded-lg border-indigo-200" placeholder="e.g. 5 Lakhs">
                </div>
                <div>
                   <label class="block mb-1 font-medium text-sm text-indigo-800">Maximum Annual Income Limit (₹)</label>
                   <input type="number" [(ngModel)]="newScheme.incomeLimit" name="income" class="w-full p-2 rounded-lg border-indigo-200" placeholder="Leaves blank if no strict limit">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                   <label class="block mb-1 font-medium text-sm text-indigo-800">Minimum Age</label>
                   <input type="number" [(ngModel)]="newScheme.minAge" name="minAge" required class="w-full p-2 rounded-lg border-indigo-200" placeholder="Default 0">
                </div>
                <div>
                   <label class="block mb-1 font-medium text-sm text-indigo-800">Maximum Age</label>
                   <input type="number" [(ngModel)]="newScheme.maxAge" name="maxAge" required class="w-full p-2 rounded-lg border-indigo-200" placeholder="Default 150">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                   <label class="block mb-1 font-medium text-sm text-indigo-800">Employment Restriction</label>
                   <select [(ngModel)]="newScheme.employmentRestriction" name="emp" class="w-full p-2 rounded-lg border-indigo-200 bg-white">
                     <option value="">No Restriction</option>
                     <option value="Private Sector,Government">Salaried / Government</option>
                     <option value="Student">Student</option>
                     <option value="Unemployed">Unemployed</option>
                   </select>
                </div>
                <div>
                   <label class="block mb-1 font-medium text-sm text-indigo-800">State Restriction</label>
                   <select [(ngModel)]="newScheme.stateRestriction" name="state" class="w-full p-2 rounded-lg border-indigo-200 bg-white">
                     <option value="">All States</option>
                     <option value="Kerala">Kerala</option>
                     <option value="Delhi">Delhi</option>
                     <option value="Maharashtra">Maharashtra</option>
                     <option value="Karnataka">Karnataka</option>
                   </select>
                </div>
            </div>
            <div>
              <label class="block mb-1 font-medium text-sm text-indigo-800">Detailed Description</label>
              <textarea [(ngModel)]="newScheme.description" name="desc" required class="w-full p-2 rounded-lg border-indigo-200" rows="2"></textarea>
            </div>
            <button type="submit" [disabled]="isSaving" class="bg-indigo-600 text-white py-2 px-6 rounded-lg font-bold hover:bg-indigo-700 self-end disabled:opacity-50">
                {{ isSaving ? 'Saving...' : 'Publish Scheme' }}
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
              <input type="number" [(ngModel)]="citizenForm.age" name="citizenAge" placeholder="e.g. 30" required 
                     class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500/20 outline-none">
            </div>
            <div>
              <label class="block mb-1.5 font-medium">Annual Income</label>
              <input type="number" [(ngModel)]="citizenForm.income" name="citizenIncome" placeholder="₹" required 
                     class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500/20 outline-none">
            </div>
            <div>
              <label class="block mb-1.5 font-medium">Employment Type</label>
              <select [(ngModel)]="citizenForm.employment" name="citizenEmp" class="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-sky-500/20 outline-none">
                <option value="Private Sector">Private Sector</option>
                <option value="Government">Government</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Student">Student</option>
              </select>
            </div>
            <div>
              <label class="block mb-1.5 font-medium">State of Residence</label>
              <select [(ngModel)]="citizenForm.state" name="citizenState" class="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-sky-500/20 outline-none">
                <option value="Kerala">Kerala</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Other">Other</option>
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
              
              <p class="text-gray-500 text-sm mb-3">{{item.description}}</p>

              <div *ngIf="item.eligible" 
                   class="inline-flex items-center gap-2 bg-green-50 text-indigo-600 px-3 py-1 rounded-lg text-sm font-semibold">
                <mat-icon class="text-sm w-4 h-4 flex items-center">verified_user</mat-icon> 
                Coverage: {{item.coverAmount}}
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
export class InsuranceCheckerComponent implements OnInit {
  authService = inject(AuthService);
  healthService = inject(HealthService);
  toast = inject(ToastService);

  result: any[] | null = null;
  allSchemes: any[] = []; // Stores database schemes

  showAddSchemeForm = false;
  isSaving = false;
  newScheme = { 
    name: '', 
    coverAmount: '', 
    description: '',
    minAge: 0,
    maxAge: 150,
    incomeLimit: null,
    employmentRestriction: '',
    stateRestriction: ''
  };

  citizenForm = {
    age: null,
    income: null,
    employment: 'Private Sector',
    state: 'Kerala'
  };

  ngOnInit() {
    this.loadSchemes();
  }

  loadSchemes() {
    this.healthService.getInsuranceSchemes().subscribe({
      next: (res) => {
        this.allSchemes = res;
      },
      error: (err) => this.toast.showError('Failed to load active insurance schemes')
    });
  }

  get isHealthWorker(): boolean {
    return this.authService.hasRole('Health Worker');
  }

  checkEligibility() {
    if (this.citizenForm.age === null || this.citizenForm.income === null) {
      this.toast.showError('Please fill in your Age and Annual Income.');
      return;
    }

    const age = Number(this.citizenForm.age);
    const income = Number(this.citizenForm.income);
    const emp = this.citizenForm.employment;
    const state = this.citizenForm.state;

    this.result = this.allSchemes.map(scheme => {
      let eligible = true;
      let reason = '';

      if (scheme.minAge > 0 && age < scheme.minAge) {
        eligible = false;
        reason = `Minimum age is ${scheme.minAge}.`;
      } else if (scheme.maxAge < 150 && age > scheme.maxAge) {
        eligible = false;
        reason = `Maximum age is ${scheme.maxAge}.`;
      } else if (scheme.incomeLimit && income > scheme.incomeLimit) {
        eligible = false;
        reason = `Maximum annual income allowed is ₹${scheme.incomeLimit}.`;
      } else if (scheme.stateRestriction && scheme.stateRestriction !== state) {
        eligible = false;
        reason = `Scheme is strictly restricted to residents of ${scheme.stateRestriction}.`;
      } else if (scheme.employmentRestriction && !scheme.employmentRestriction.includes(emp)) {
        eligible = false;
        reason = `Employment type strictly limited to: ${scheme.employmentRestriction.replace(',', ' or ')}.`;
      }

      return {
        ...scheme,
        eligible,
        reason
      };
    });

    // Sort to show eligible ones first
    this.result.sort((a, b) => (a.eligible === b.eligible ? 0 : a.eligible ? -1 : 1));
  }

  addScheme() {
    this.isSaving = true;
    this.healthService.addInsuranceScheme(this.newScheme).subscribe({
      next: (res) => {
        this.toast.showSuccess('Insurance Scheme successfully published!');
        this.showAddSchemeForm = false;
        this.newScheme = { name: '', coverAmount: '', description: '', minAge: 0, maxAge: 150, incomeLimit: null, employmentRestriction: '', stateRestriction: '' };
        this.loadSchemes(); // refresh list
        this.isSaving = false;
      },
      error: (err) => {
        this.toast.showError('Error adding scheme.');
        this.isSaving = false;
      }
    });
  }
}

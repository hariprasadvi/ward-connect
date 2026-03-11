import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HealthService } from '../../../services/health.service';

@Component({
  selector: 'app-donation-matching',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-6 md:p-12 font-sans text-slate-800">
      
      <!-- Header -->
      <div class="text-center mb-12 relative z-10">
        <div class="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-tr from-pink-400 to-rose-500 text-white rounded-3xl shadow-xl shadow-pink-500/30 transform hover:scale-110 transition-transform duration-300">
          <mat-icon style="font-size: 48px; width: 48px; height: 48px;">favorite</mat-icon>
        </div>
        <h1 class="text-5xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
          Life Connect
        </h1>
        <p class="text-lg text-slate-500 font-medium">Bridging the gap between hope and heroes.</p>
      </div>

      <div class="max-w-4xl mx-auto backdrop-blur-xl bg-white/60 p-8 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
        
        <!-- Decorative blob -->
        <div class="absolute -top-32 -right-32 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div class="absolute -bottom-32 -left-32 w-64 h-64 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <!-- Health Worker View -->
        <div *ngIf="isHealthWorker; else citizenView" class="relative z-10">
           <div class="flex justify-between items-center mb-8 border-b border-pink-100 pb-4">
              <div>
                <h3 class="font-bold text-2xl text-slate-800">Priority Requests</h3>
                <p class="text-sm text-slate-500 mt-1">Manage urgent blood requirements</p>
              </div>
              <button (click)="showAddRequest = !showAddRequest" 
                  class="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                  <mat-icon>{{showAddRequest ? 'close' : 'add'}}</mat-icon>
                  {{showAddRequest ? 'Close Form' : 'New Request'}}
              </button>
           </div>

           <!-- Add Request Form -->
           <div *ngIf="showAddRequest" class="bg-white p-8 rounded-2xl border border-pink-100 mb-8 shadow-sm animate-fade-in-down">
               <h4 class="font-bold text-lg mb-6 text-pink-600 flex items-center gap-2">
                 <mat-icon>local_hospital</mat-icon> Create New Requirement
               </h4>
               <form (ngSubmit)="addRequest()" class="space-y-6">
                   <div class="grid md:grid-cols-2 gap-6">
                       <div class="space-y-2">
                           <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Patient Name</label>
                           <input type="text" [(ngModel)]="newRequest.name" name="pName" 
                                  class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-slate-400" placeholder="e.g. John Doe">
                       </div>
                       <div class="space-y-2">
                           <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Blood Group</label>
                           <select [(ngModel)]="newRequest.bloodGroup" name="pBg" 
                                   class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500 transition-all font-semibold text-slate-700">
                               <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
                               <option>A-</option><option>B-</option><option>O-</option><option>AB-</option>
                           </select>
                       </div>
                       <div class="col-span-2 space-y-2">
                           <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Hospital / Location</label>
                           <input type="text" [(ngModel)]="newRequest.location" name="pLoc" 
                                  class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-slate-400" placeholder="e.g. City General Hospital, Ward 4">
                       </div>
                       <div class="col-span-2 space-y-2">
                          <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Contact Number</label>
                          <input type="text" [(ngModel)]="newRequest.contact" name="pContact" 
                                 class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500 transition-all placeholder-slate-400" placeholder="+91 98765 43210">
                      </div>
                   </div>
                   <div class="flex justify-end pt-4">
                      <button type="submit" class="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-500/30 hover:-translate-y-1 transition-all">
                        Publish Requirement
                      </button>
                   </div>
               </form>
           </div>

           <!-- List of Requests -->
           <div class="space-y-4">
              <div *ngFor="let req of pendingDonations" 
                  class="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="flex items-center gap-5">
                      <div class="w-16 h-16 bg-pink-50 text-pink-600 font-black text-xl rounded-2xl flex items-center justify-center shadow-inner">
                        {{req.bloodGroup}}
                      </div>
                      <div>
                          <div class="font-bold text-lg text-slate-800">{{req.patientName}}</div>
                          <div class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <mat-icon class="text-xs" style="font-size: 16px; width: 16px; height: 16px;">location_on</mat-icon> 
                            {{req.hospitalLocation}}
                          </div>
                      </div>
                  </div>
                  <div class="flex gap-3 pl-20 md:pl-0">
                      <button class="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">Details</button>
                      <button (click)="acceptDonation(req.id)" 
                        class="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:text-emerald-700 transition-all flex items-center gap-2">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">check</mat-icon> Resolve
                      </button>
                  </div>
              </div>
              <div *ngIf="pendingDonations.length === 0" class="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <div class="text-4xl mb-2">🎉</div>
                  <p class="text-slate-500 font-medium">No active blood requests at the moment.</p>
              </div>
           </div>
        </div>

        <!-- Citizen View -->
        <ng-template #citizenView>
          <div class="bg-slate-100 p-1.5 rounded-2xl flex mb-10 relative z-10 max-w-lg mx-auto">
            <button (click)="role = 'donor'"
                    class="flex-1 py-3.5 rounded-xl font-bold transition-all duration-300 relative overflow-hidden"
                    [class.bg-white]="role === 'donor'"
                    [class.shadow-md]="role === 'donor'"
                    [class.text-slate-900]="role === 'donor'"
                    [class.text-slate-500]="role !== 'donor'">
              I want to Donate
            </button>
            <button (click)="role = 'recipient'"
                    class="flex-1 py-3.5 rounded-xl font-bold transition-all duration-300"
                    [class.bg-white]="role === 'recipient'"
                    [class.shadow-md]="role === 'recipient'"
                    [class.text-slate-900]="role === 'recipient'"
                    [class.text-slate-500]="role !== 'recipient'">
              I need a Match
            </button>
          </div>

          <div class="bg-white/80 p-8 rounded-3xl shadow-lg border border-white mb-8 relative z-10 backdrop-blur-md">
            <h3 class="text-2xl font-bold mb-6 text-slate-800">{{ role === 'donor' ? 'Join the Hero Registry' : 'Search Compatible Donors' }}</h3>
            
            <form (ngSubmit)="handleRegister()" class="space-y-5">
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700 uppercase tracking-wider">Blood Group</label>
                <div class="grid grid-cols-4 gap-3">
                   <button type="button" *ngFor="let bg of ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']" 
                     class="py-2 rounded-lg font-bold border transition-all"
                     [class.bg-pink-600]="selectedBg === bg" [class.text-white]="selectedBg === bg" [class.border-pink-600]="selectedBg === bg"
                     [class.bg-white]="selectedBg !== bg" [class.text-slate-600]="selectedBg !== bg" [class.border-slate-200]="selectedBg !== bg"
                     (click)="selectedBg = bg">
                     {{bg}}
                   </button>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700 uppercase tracking-wider">Location</label>
                <div class="relative">
                  <mat-icon class="absolute left-4 top-3.5 text-slate-400">search</mat-icon>
                  <input type="text" placeholder="Enter pincode or city..." 
                        class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500 outline-none transition-all placeholder-slate-400">
                </div>
              </div>

              <div *ngIf="registered && role === 'donor'; else submitBtn" 
                   class="p-6 bg-emerald-50 text-emerald-800 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold ring-1 ring-emerald-100 animate-pulse">
                <mat-icon class="text-3xl">check_circle</mat-icon> 
                <span>You have been registered successfully!</span>
              </div>
              
              <ng-template #submitBtn>
                <button type="submit" 
                        class="w-full mt-4 py-4 px-6 rounded-2xl font-extrabold text-white text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
                        [class.shadow-pink-500-30]="role === 'donor'"
                        [class.shadow-blue-500-30]="role === 'recipient'"
                        [style.background]="role === 'donor' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'linear-gradient(135deg, #3b82f6, #4f46e5)'">
                  <span *ngIf="role === 'donor'">Register as Donor</span>
                  <span *ngIf="role === 'recipient'" class="flex items-center gap-2"><mat-icon>search</mat-icon> Find Donors</span>
                </button>
              </ng-template>
            </form>
          </div>
        </ng-template>

      </div>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
  `]
})
export class DonationMatchingComponent implements OnInit {
  authService = inject(AuthService);
  healthService = inject(HealthService);

  role: 'donor' | 'recipient' = 'donor';
  registered = false;
  selectedBg = 'O+'; // UI state for selection

  // Health Worker Specifics
  showAddRequest = false;
  newRequest = { name: '', bloodGroup: 'O+', location: '', contact: '' };

  pendingDonations: any[] = [];

  get isHealthWorker(): boolean {
    return this.authService.hasRole('Health Worker');
  }

  ngOnInit() {
    if (this.isHealthWorker) {
      this.loadRequests();
    }
  }

  loadRequests() {
    this.healthService.getDonationRequests().subscribe({
      next: (data) => this.pendingDonations = data,
      error: (err) => console.error('Error loading donations', err)
    });
  }

  handleRegister() {
    this.registered = true;
    setTimeout(() => this.registered = false, 3000);
  }

  acceptDonation(id: string) {
    alert('Request marked as resolved (simulation).');
    this.pendingDonations = this.pendingDonations.filter(d => d.id !== id);
    // In production, call API to delete/update status
  }

  addRequest() {
    if (this.newRequest.name && this.newRequest.location) {
      const payload = {
        patientName: this.newRequest.name,
        bloodGroup: this.newRequest.bloodGroup,
        hospitalLocation: this.newRequest.location,
        contactNumber: this.newRequest.contact
      };

      this.healthService.createDonationRequest(payload).subscribe({
        next: (res) => {
          this.pendingDonations.unshift(res);
          this.showAddRequest = false;
          this.newRequest = { name: '', bloodGroup: 'O+', location: '', contact: '' };
        },
        error: (err) => alert('Failed to create request')
      });
    }
  }
}

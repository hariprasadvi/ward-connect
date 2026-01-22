import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-donation-matching',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="p-8 max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <div class="w-20 h-20 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
          <mat-icon style="font-size: 40px; width: 40px; height: 40px;">favorite</mat-icon>
        </div>
        <h1 class="text-3xl font-bold mb-2">Life Connect</h1>
        <p class="text-gray-500">Matching brave donors with those in need.</p>
      </div>

      <!-- Health Worker View -->
      <div *ngIf="isHealthWorker; else citizenView" class="mb-8">
         <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg text-pink-900">Patient Blood Requests</h3>
            <button (click)="showAddRequest = !showAddRequest" class="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-pink-700">
                {{showAddRequest ? 'Cancel' : 'Add Request'}}
            </button>
         </div>

         <!-- Add Request Form -->
         <div *ngIf="showAddRequest" class="bg-pink-50 p-6 rounded-2xl border border-pink-100 mb-6 animate-fade-in">
             <form (ngSubmit)="addRequest()" class="flex flex-col gap-4">
                 <div class="grid grid-cols-2 gap-4">
                     <div>
                         <label class="block text-sm font-medium text-pink-800 mb-1">Patient Name</label>
                         <input type="text" [(ngModel)]="newRequest.name" name="pName" class="w-full p-2 rounded-lg border-pink-200">
                     </div>
                     <div>
                         <label class="block text-sm font-medium text-pink-800 mb-1">Blood Group</label>
                         <select [(ngModel)]="newRequest.bloodGroup" name="pBg" class="w-full p-2 rounded-lg border-pink-200">
                             <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
                             <option>A-</option><option>B-</option><option>O-</option><option>AB-</option>
                         </select>
                     </div>
                     <div class="col-span-2">
                         <label class="block text-sm font-medium text-pink-800 mb-1">Hospital / Location</label>
                         <input type="text" [(ngModel)]="newRequest.location" name="pLoc" class="w-full p-2 rounded-lg border-pink-200">
                     </div>
                 </div>
                 <button type="submit" class="bg-pink-600 text-white font-bold py-2 rounded-lg self-end px-6">Submit Request</button>
             </form>
         </div>

         <!-- List of Requests -->
         <div class="space-y-3">
            <div *ngFor="let req of pendingDonations" class="bg-white p-4 rounded-xl border border-pink-100 shadow-sm flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="bg-pink-50 text-pink-600 font-bold px-3 py-1 rounded text-sm">{{req.bloodGroup}}</div>
                    <div>
                        <div class="font-semibold">{{req.name}}</div>
                        <div class="text-sm text-gray-400">Needs match at {{req.location}}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200">View</button>
                    <button (click)="acceptDonation(req.id)" class="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-200">
                        Mark Resolved
                    </button>
                </div>
            </div>
            <div *ngIf="pendingDonations.length === 0" class="text-center text-gray-400 text-sm py-4">
                No active blood requests.
            </div>
         </div>
      </div>

      <!-- Citizen View -->
      <ng-template #citizenView>
      <div class="bg-gray-100 p-1 rounded-xl flex mb-8">
        <button (click)="role = 'donor'"
                class="flex-1 py-3 rounded-lg font-semibold transition-all"
                [class.bg-white]="role === 'donor'"
                [class.shadow-sm]="role === 'donor'"
                [class.text-gray-900]="role === 'donor'"
                [class.text-gray-500]="role !== 'donor'">
          I want to Donate
        </button>
        <button (click)="role = 'recipient'"
                class="flex-1 py-3 rounded-lg font-semibold transition-all"
                [class.bg-white]="role === 'recipient'"
                [class.shadow-sm]="role === 'recipient'"
                [class.text-gray-900]="role === 'recipient'"
                [class.text-gray-500]="role !== 'recipient'">
          I need a Match
        </button>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 class="text-xl font-bold mb-4">{{ role === 'donor' ? 'Donor Registration' : 'Find a Donor' }}</h3>
        
        <form (ngSubmit)="handleRegister()" class="flex flex-col gap-4">
          <div>
            <label class="block mb-2 font-medium">Blood Type</label>
            <select class="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-pink-500/20 outline-none">
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          <div>
            <label class="block mb-2 font-medium">Location</label>
            <input type="text" placeholder="Enter zip code or city" 
                   class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 outline-none">
          </div>

          <div *ngIf="registered && role === 'donor'; else submitBtn" 
               class="p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-center gap-2 font-medium">
            <mat-icon>check_circle</mat-icon> Thank you! You are registered.
          </div>
          
          <ng-template #submitBtn>
            <button type="submit" 
                    class="mt-4 py-3 px-6 rounded-xl font-bold text-white shadow-lg shadow-pink-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    [style.background]="role === 'donor' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'linear-gradient(135deg, #3b82f6, #6366f1)'">
              <span *ngIf="role === 'donor'">Register as Donor</span>
              <span *ngIf="role === 'recipient'" class="flex items-center gap-2"><mat-icon>search</mat-icon> Search Matches</span>
            </button>
          </ng-template>
        </form>
      </div>

      <div *ngIf="role === 'recipient'" class="mt-8">
        <h4 class="font-bold text-lg mb-4">Available Matches Nearby</h4>
        <div class="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div class="bg-pink-500 text-white font-bold p-4 rounded-xl text-xl min-w-[60px] text-center">O+</div>
          <div>
            <div class="font-semibold">Anonymous Donor #492</div>
            <div class="text-sm text-gray-500">5km away • Verified • Available Now</div>
          </div>
          <button class="ml-auto border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">Contact</button>
        </div>
      </div>
      </ng-template>
    </div>
  `
})
export class DonationMatchingComponent {
  authService = inject(AuthService);

  role: 'donor' | 'recipient' = 'donor';
  registered = false;

  // Health Worker Specifics
  showAddRequest = false;
  newRequest = { name: '', bloodGroup: 'O+', location: '' };

  pendingDonations = [
    { id: 101, name: 'Rahul K.', bloodGroup: 'B+', location: 'Ward 12' },
    { id: 102, name: 'Sneha P.', bloodGroup: 'O-', location: 'Ward 08' }
  ];

  get isHealthWorker(): boolean {
    return this.authService.hasRole('Health Worker');
  }

  handleRegister() {
    this.registered = true;
    setTimeout(() => this.registered = false, 3000);
  }

  acceptDonation(id: number) {
    this.pendingDonations = this.pendingDonations.filter(d => d.id !== id);
  }

  addRequest() {
    if (this.newRequest.name && this.newRequest.location) {
      this.pendingDonations.unshift({
        id: Date.now(),
        name: this.newRequest.name,
        bloodGroup: this.newRequest.bloodGroup,
        location: this.newRequest.location
      });
      this.showAddRequest = false;
      this.newRequest = { name: '', bloodGroup: 'O+', location: '' };
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HealthService } from '../../../services/health.service';
import { ToastService } from '../../../services/toast.service';

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

            <!-- Mode Toggle (For Citizens) -->
        <div *ngIf="!isHealthWorker" class="bg-slate-100 p-1.5 rounded-2xl flex mb-10 relative z-10 max-w-lg mx-auto">
          <button (click)="role = 'donor'; loadGlobalRequests()"
                  class="flex-1 py-3.5 rounded-xl font-bold transition-all duration-300 relative overflow-hidden"
                  [class.bg-white]="role === 'donor'"
                  [class.shadow-md]="role === 'donor'"
                  [class.text-slate-900]="role === 'donor'"
                  [class.text-slate-500]="role !== 'donor'">
            I want to Donate
          </button>
          <button (click)="role = 'recipient'; loadMyRequests()"
                  class="flex-1 py-3.5 rounded-xl font-bold transition-all duration-300"
                  [class.bg-white]="role === 'recipient'"
                  [class.shadow-md]="role === 'recipient'"
                  [class.text-slate-900]="role === 'recipient'"
                  [class.text-slate-500]="role !== 'recipient'">
            My Requests & History
          </button>
        </div>

        <!-- Mode Toggle (For Asha Workers) -->
        <div *ngIf="isHealthWorker" class="bg-slate-100 p-1.5 rounded-2xl flex mb-10 relative z-10 max-w-lg mx-auto">
          <button (click)="role = 'donor'; loadGlobalRequests()"
                  class="flex-1 py-3.5 rounded-xl font-bold transition-all duration-300 relative overflow-hidden"
                  [class.bg-white]="role === 'donor'"
                  [class.shadow-md]="role === 'donor'"
                  [class.text-slate-900]="role === 'donor'"
                  [class.text-slate-500]="role !== 'donor'">
            Global Active Feed
          </button>
          <button (click)="role = 'recipient'; loadMyRequests()"
                  class="flex-1 py-3.5 rounded-xl font-bold transition-all duration-300"
                  [class.bg-white]="role === 'recipient'"
                  [class.shadow-md]="role === 'recipient'"
                  [class.text-slate-900]="role === 'recipient'"
                  [class.text-slate-500]="role !== 'recipient'">
            My Created History
          </button>
        </div>

        <div class="relative z-10">

            <!-- ACTION BAR: Create New Request -->
            <div *ngIf="role === 'recipient'" class="flex justify-between items-center mb-8 border-b border-pink-100 pb-4">
              <div>
                <h3 class="font-bold text-2xl text-slate-800">{{ isHealthWorker ? 'My Priority Requests' : 'My Blood Requests' }}</h3>
                <p class="text-sm text-slate-500 mt-1">{{ isHealthWorker ? 'Manage urgent requirements you generated' : 'Manage your active requests and history' }}</p>
              </div>
              <button (click)="showAddRequest = !showAddRequest" 
                  class="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                  <mat-icon>{{showAddRequest ? 'close' : 'add'}}</mat-icon>
                  {{showAddRequest ? 'Cancel' : 'New Request'}}
              </button>
            </div>

            <!-- Add Request Form -->
            <div *ngIf="showAddRequest && (isHealthWorker || role === 'recipient')" class="bg-white p-8 rounded-2xl border border-pink-100 mb-8 shadow-sm">
                <h4 class="font-bold text-lg mb-6 text-pink-600 flex items-center gap-2">
                  <mat-icon>local_hospital</mat-icon> Create New Blood Requirement
                </h4>
                <form (ngSubmit)="addRequest()" class="space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Patient Name</label>
                            <input type="text" [(ngModel)]="newRequest.name" name="pName" required
                                   class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. John Doe">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Blood Group</label>
                            <select [(ngModel)]="newRequest.bloodGroup" name="pBg" 
                                    class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500 font-semibold text-slate-700">
                                <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
                                <option>A-</option><option>B-</option><option>O-</option><option>AB-</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Units Required</label>
                            <input type="number" [(ngModel)]="newRequest.requiredUnits" name="pUnits" required min="1"
                                   class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. 3">
                        </div>
                        <div class="space-y-2">
                           <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Contact Number</label>
                           <input type="text" [(ngModel)]="newRequest.contact" name="pContact" required
                                  class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500" placeholder="+91 98765 43210">
                        </div>
                        <div class="col-span-2 space-y-2">
                            <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Hospital / Location</label>
                            <input type="text" [(ngModel)]="newRequest.location" name="pLoc" required
                                   class="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. City General Hospital, Ward 4">
                        </div>
                    </div>
                    <div class="flex justify-end pt-4">
                       <button type="submit" [disabled]="isSaving" class="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50">
                         {{ isSaving ? 'Publishing...' : 'Publish Requirement' }}
                       </button>
                    </div>
                </form>
            </div>

            <!-- Global Pledging UI (Feed) -->
            <div *ngIf="role === 'donor'">
               <h3 class="text-2xl font-bold mb-6 text-slate-800">Global Active Requests</h3>
               <div class="space-y-4">
                  <div *ngFor="let req of pendingDonations" 
                      class="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all flex flex-col gap-4 relative">
                      
                      <div class="flex items-start justify-between">
                          <div class="flex items-center gap-5">
                              <div class="w-16 h-16 bg-pink-50 text-pink-600 font-black text-xl rounded-2xl flex items-center justify-center shadow-inner">
                                {{req.bloodGroup}}
                              </div>
                              <div>
                                  <div class="font-bold text-lg text-slate-800">{{req.patientName}}</div>
                                  <div class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">location_on</mat-icon> 
                                    {{req.hospitalLocation}}
                                  </div>
                                  <div class="text-xs text-slate-400 mt-1">Requested by: {{req.User?.full_name || 'Unknown'}} <span *ngIf="req.User?.mobile_number">({{req.User?.mobile_number}})</span></div>
                              </div>
                          </div>
                      </div>

                      <!-- Tracking Progress Bar -->
                      <div class="mt-2 text-sm">
                        <div class="flex justify-between font-bold mb-1">
                           <span class="text-emerald-600">{{req.fulfilledUnits}} Units Secured</span>
                           <span class="text-pink-600">{{req.requiredUnits}} Units Needed</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div class="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-500" 
                               [style.width.%]="(req.fulfilledUnits / req.requiredUnits) * 100"></div>
                        </div>
                        <div class="mt-2 text-xs text-slate-500" *ngIf="req.DonationPledges?.length > 0">
                           <span class="font-bold">Recent Pledges: </span> 
                           <span *ngFor="let p of req.DonationPledges; let last=last">
                              {{p.User?.full_name}} ({{p.unitsDonated}}U)<span *ngIf="!last">, </span>
                           </span>
                        </div>
                      </div>

                      <!-- Action Buttons -->
                      <div class="flex gap-2 items-center justify-end mt-2 p-3 bg-slate-50 rounded-xl" *ngIf="req.fulfilledUnits < req.requiredUnits">
                          <ng-container *ngIf="activePledgeId !== req.id">
                             <button (click)="openPledge(req)" class="px-6 py-2 rounded-xl text-sm font-bold bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors flex items-center gap-2">
                               <mat-icon style="font-size:18px;width:18px;height:18px;">volunteer_activism</mat-icon> Pledge Blood
                             </button>
                          </ng-container>
                          
                          <!-- Fractional Input Overlay -->
                          <div *ngIf="activePledgeId === req.id" class="flex items-center gap-3 w-full justify-end animate-fade-in">
                             <span class="text-sm font-bold text-slate-600">Units to donate:</span>
                             <input type="number" [(ngModel)]="pledgeAmount" min="1" [max]="req.requiredUnits - req.fulfilledUnits"
                                    class="w-24 p-2 border-2 border-pink-200 rounded-lg text-sm font-bold focus:border-pink-500 outline-none text-center">
                             <button (click)="confirmPledge(req)" [disabled]="isSaving"
                                     class="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm rounded-lg font-bold shadow-md hover:shadow-lg disabled:opacity-50">
                                Confirm
                             </button>
                             <button (click)="activePledgeId = null" class="px-4 py-2 bg-slate-200 text-slate-700 text-sm rounded-lg font-bold hover:bg-slate-300">
                                Cancel
                             </button>
                          </div>
                      </div>
                  </div>
                  
                  <div *ngIf="pendingDonations.length === 0" class="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                      <div class="text-4xl mb-4">🩺</div>
                      <p class="text-slate-500 font-bold text-lg">No active blood requests globally.</p>
                      <p class="text-slate-400 text-sm">Everyone is currently healthy and fully matched.</p>
                  </div>
               </div>
            </div>

            <!-- Personal Requests & History Dashboard -->
            <div *ngIf="role === 'recipient'">
               
               <!-- Active Requests Feed -->
               <div class="mb-10" *ngIf="myActiveRequests.length > 0">
                 <h4 class="font-bold text-xl text-slate-800 mb-4 flex items-center gap-2">
                   <mat-icon class="text-amber-500">pending_actions</mat-icon> Currently Active
                 </h4>
                 <div class="space-y-4">
                    <div *ngFor="let req of myActiveRequests" 
                        class="group bg-white p-6 rounded-2xl border-l-4 border-l-amber-400 border border-slate-100 shadow-sm flex flex-col gap-4">
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 font-black text-lg rounded-xl flex items-center justify-center">
                                  {{req.bloodGroup}}
                                </div>
                                <div>
                                    <div class="font-bold text-lg text-slate-800">{{req.patientName}}</div>
                                    <div class="text-xs text-slate-500">Requested on: {{req.createdAt | date}}</div>
                                </div>
                            </div>
                            
                            <div class="text-right">
                               <div class="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold mb-1 uppercase tracking-wider">
                                  {{req.status}}
                               </div>
                            </div>
                        </div>

                        <div class="mt-2 text-sm">
                          <div class="flex justify-between font-bold mb-1">
                             <span class="text-slate-600">{{req.fulfilledUnits}} Units Secured</span>
                             <span class="text-indigo-600">{{req.requiredUnits}} Units Needed</span>
                          </div>
                          <div class="w-full bg-slate-100 rounded-full h-2">
                            <div class="bg-indigo-500 h-2 rounded-full transition-all duration-500" [style.width.%]="(req.fulfilledUnits / req.requiredUnits) * 100"></div>
                          </div>
                          <div class="mt-2 text-xs text-slate-500" *ngIf="req.DonationPledges?.length > 0">
                             <span class="font-bold">Recent Pledges: </span> 
                             <span *ngFor="let p of req.DonationPledges; let last=last">
                                <span class="text-indigo-600 font-bold">{{p.User?.full_name}} ({{p.User?.mobile_number}})</span> donated {{p.unitsDonated}}U<span *ngIf="!last">, </span>
                             </span>
                          </div>
                        </div>
                        
                        <div class="flex justify-end mt-2 pt-2 border-t border-slate-100">
                            <button (click)="cancelRequest(req.id)" class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold rounded-lg transition-colors flex items-center gap-1">
                                <mat-icon style="font-size:16px;width:16px;height:16px;">cancel</mat-icon> Cancel Request
                            </button>
                        </div>
                    </div>
                 </div>
               </div>

               <!-- Fulfilled & History Feed -->
               <div *ngIf="myHistoryRequests.length > 0">
                 <h4 class="font-bold text-xl text-slate-800 mb-4 flex items-center gap-2">
                   <mat-icon class="text-slate-400">history</mat-icon> Past History
                 </h4>
                 <div class="space-y-4 opacity-90 transition-opacity hover:opacity-100">
                    <div *ngFor="let req of myHistoryRequests" 
                        class="group bg-slate-50 p-6 rounded-2xl border-l-4 border border-slate-200 shadow-sm flex flex-col gap-3"
                        [ngClass]="{'border-l-emerald-500': req.status === 'Fulfilled', 'border-l-slate-400': req.status === 'Cancelled'}">
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 text-slate-600 font-black text-lg rounded-xl flex items-center justify-center shadow-inner"
                                     [ngClass]="{'bg-emerald-100 text-emerald-700': req.status === 'Fulfilled', 'bg-slate-200': req.status === 'Cancelled'}">
                                  {{req.bloodGroup}}
                                </div>
                                <div>
                                    <div class="font-bold text-lg text-slate-800 line-through decoration-slate-300" *ngIf="req.status === 'Cancelled'">{{req.patientName}}</div>
                                    <div class="font-bold text-lg text-slate-800" *ngIf="req.status === 'Fulfilled'">{{req.patientName}}</div>
                                    <div class="text-xs text-slate-500">Requested on: {{req.createdAt | date}}</div>
                                </div>
                            </div>
                            
                            <div class="text-right">
                               <div class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                                    [ngClass]="{'bg-emerald-100 text-emerald-700': req.status === 'Fulfilled', 'bg-slate-200 text-slate-600': req.status === 'Cancelled'}">
                                  {{req.status}}
                               </div>
                            </div>
                        </div>

                        <!-- Success Banner for Fulfilled -->
                        <div class="mt-2 text-sm bg-emerald-50 p-3 rounded-xl border border-emerald-100" *ngIf="req.status === 'Fulfilled'">
                           <div class="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                              <mat-icon style="font-size:18px;width:18px;height:18px;">celebration</mat-icon> Requirement Successfully Met!
                           </div>
                           <p class="text-xs text-emerald-600 font-medium">All {{req.requiredUnits}} Units were successfully secured from generous donors.</p>
                           <div class="mt-2 text-xs text-emerald-800" *ngIf="req.DonationPledges?.length > 0">
                             <span class="font-bold">Heroes: </span> 
                             <span *ngFor="let p of req.DonationPledges; let last=last">
                                {{p.User?.full_name}} ({{p.User?.mobile_number}}) [{{p.unitsDonated}}U]<span *ngIf="!last">, </span>
                             </span>
                           </div>
                        </div>

                        <div class="mt-2 text-sm bg-slate-100 p-3 rounded-xl border border-slate-200" *ngIf="req.status === 'Cancelled'">
                           <div class="flex items-center gap-2 text-slate-500 font-bold mb-1">
                              <mat-icon style="font-size:18px;width:18px;height:18px;">block</mat-icon> Cancelled by User
                           </div>
                           <p class="text-xs text-slate-400 font-medium">This request was manually withdrawn before being completely fulfilled.</p>
                        </div>
                    </div>
                 </div>
               </div>
                  
               <!-- Empty State -->
               <div *ngIf="myRequests.length === 0" class="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                    <p class="text-slate-500 font-medium border border-transparent">You have no active or past blood requests.</p>
               </div>
            </div>

        </div>
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
    .animate-blob { animation: blob 7s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DonationMatchingComponent implements OnInit {
  authService = inject(AuthService);
  healthService = inject(HealthService);
  toast = inject(ToastService);

  role: 'donor' | 'recipient' = 'donor';
  
  showAddRequest = false;
  isSaving = false;
  newRequest = { name: '', bloodGroup: 'O+', location: '', contact: '', requiredUnits: 1 };

  pendingDonations: any[] = [];
  myRequests: any[] = [];

  activePledgeId: string | null = null;
  pledgeAmount: number = 1;

  get isHealthWorker(): boolean {
    return this.authService.hasRole('Health Worker');
  }

  get myActiveRequests(): any[] {
    return this.myRequests.filter(req => req.status === 'Pending');
  }

  get myHistoryRequests(): any[] {
    return this.myRequests.filter(req => req.status !== 'Pending');
  }

  ngOnInit() {
    this.refreshView();
  }

  refreshView() {
    if (this.role === 'donor') {
      this.loadGlobalRequests();
    }
    if (this.role === 'recipient') {
      this.loadMyRequests();
    }
  }

  loadGlobalRequests() {
    this.healthService.getDonationRequests().subscribe({
      next: (data) => this.pendingDonations = data,
      error: () => this.toast.showError('Failed to load global active requests')
    });
  }

  loadMyRequests() {
    this.healthService.getUserDonationRequests().subscribe({
      next: (data) => this.myRequests = data,
      error: () => this.toast.showError('Failed to load your requests')
    });
  }

  addRequest() {
    if (!this.newRequest.name || !this.newRequest.location || !this.newRequest.requiredUnits) {
       this.toast.showError('Please fill all required constraint fields.');
       return;
    }
    this.isSaving = true;
    const payload = {
      patientName: this.newRequest.name,
      bloodGroup: this.newRequest.bloodGroup,
      hospitalLocation: this.newRequest.location,
      contactNumber: this.newRequest.contact,
      requiredUnits: this.newRequest.requiredUnits
    };

    this.healthService.createDonationRequest(payload).subscribe({
      next: (res) => {
        this.toast.showSuccess('Blood request mathematically anchored into the system!');
        this.showAddRequest = false;
        this.newRequest = { name: '', bloodGroup: 'O+', location: '', contact: '', requiredUnits: 1 };
        this.refreshView();
        this.isSaving = false;
      },
      error: () => {
        this.toast.showError('Failed to secure blood request.');
        this.isSaving = false;
      }
    });
  }

  openPledge(req: any) {
    this.activePledgeId = req.id;
    this.pledgeAmount = 1; // Default
  }

  confirmPledge(req: any) {
    const maxAllowed = req.requiredUnits - req.fulfilledUnits;
    if (this.pledgeAmount <= 0 || this.pledgeAmount > maxAllowed) {
       this.toast.showError(`Invalid amount. You can pledge between 1 and ${maxAllowed} units.`);
       return;
    }

    this.isSaving = true;
    this.healthService.pledgeBloodDonation(req.id, this.pledgeAmount).subscribe({
       next: () => {
         this.toast.showSuccess(`Success! Pledged ${this.pledgeAmount} units of ${req.bloodGroup} blood.`);
         this.activePledgeId = null;
         this.isSaving = false;
         this.refreshView();
       },
       error: (err) => {
         this.toast.showError(err.error?.message || 'Error processing pledge');
         this.isSaving = false;
       }
    });
  }

  cancelRequest(id: string) {
    if (confirm('Are you absolutely sure you want to cancel this request? It will be removed from the global feed.')) {
        this.healthService.cancelDonationRequest(id).subscribe({
           next: () => {
             this.toast.showSuccess('Request cancelled successfully.');
             this.loadMyRequests();
           },
           error: () => this.toast.showError('Failed to cancel request.')
        });
    }
  }
}

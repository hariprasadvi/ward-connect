import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthService } from '../../../services/health.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-op-booking',
    standalone: true,
    imports: [CommonModule, FormsModule, DatePipe],
    template: `
    <div class="booking-container fade-in">
        <header class="section-header">
            <h1>{{ isHealthWorker ? 'Manage OP Bookings' : 'OP Ticket Booking' }}</h1>
            <p>{{ isHealthWorker ? 'Review, approve, or reshedule appointments' : 'Book your Out-Patient visits easily' }}</p>
        </header>

        <!-- CITIZEN VIEW -->
        <ng-container *ngIf="!isHealthWorker">
            <div class="booking-grid">
                <!-- Book new -->
                <div class="booking-card form-card shadow">
                    <h2>Book New OP Ticket</h2>
                    <form (ngSubmit)="bookAppointment()" #bookingForm="ngForm" class="modern-form">
                        <div class="form-group">
                            <label>Hospital</label>
                            <input type="text" [(ngModel)]="newBooking.hospital" name="hospital" required class="form-control" placeholder="E.g. City General Hospital">
                        </div>
                        <div class="form-group">
                            <label>Department</label>
                            <input type="text" [(ngModel)]="newBooking.department" name="department" required class="form-control" placeholder="E.g. Cardiology, General Medicine">
                        </div>
                        <div class="form-group">
                            <label>Preferred Date</label>
                            <input type="date" [(ngModel)]="newBooking.date" name="date" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Preferred Time Slot</label>
                            <select [(ngModel)]="newBooking.timeSlot" name="timeSlot" required class="form-control">
                                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Patient Details & Symptoms</label>
                            <textarea [(ngModel)]="newBooking.patientDetails" name="patientDetails" rows="3" required class="form-control" placeholder="Briefly describe your symptoms/reason for visit..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" [disabled]="!bookingForm.form.valid">Submit Booking Request</button>
                    </form>
                </div>

                <!-- My Appointments -->
                <div class="booking-card list-card shadow">
                    <h2>My Appointments</h2>
                    <div class="appointments-list" *ngIf="myBookings.length > 0; else noBookings">
                        <div class="appointment-item" *ngFor="let booking of myBookings">
                            <div class="apt-header">
                                <span class="apt-dept">{{booking.department}}</span>
                                <span class="status-badge" [ngClass]="booking.status.toLowerCase()">{{booking.status}}</span>
                            </div>
                            <div class="apt-body">
                                <p><strong>Hospital:</strong> {{booking.hospital}}</p>
                                <p><strong>Date:</strong> {{booking.date | date}} | <strong>Time:</strong> {{booking.timeSlot}}</p>
                                <p *ngIf="booking.tokenNumber" class="text-success"><strong>Token Number:</strong> {{booking.tokenNumber}}</p>
                                <p *ngIf="booking.rejectionReason" class="text-danger"><strong>Reason:</strong> {{booking.rejectionReason}}</p>
                            </div>
                            <div class="apt-actions" *ngIf="booking.status === 'Pending'">
                                <button (click)="cancelBooking(booking.id)" class="btn btn-sm btn-outline-danger">Cancel</button>
                            </div>
                        </div>
                    </div>
                    <ng-template #noBookings>
                        <p class="text-muted text-center py-4">You have no appointments booked.</p>
                    </ng-template>
                </div>
            </div>
        </ng-container>

        <!-- HEALTH WORKER VIEW -->
        <ng-container *ngIf="isHealthWorker">
             <div class="admin-panel shadow">
                <div class="table-responsive">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>Citizen</th>
                                <th>Hospital & Dept</th>
                                <th>Date & Time</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let b of allBookings">
                                <td>
                                    <strong>{{b.User?.name}}</strong><br>
                                    <small>{{b.User?.phone}}</small>
                                </td>
                                <td>{{b.hospital}}<br><span class="text-muted">{{b.department}}</span></td>
                                <td>{{b.date | date}}<br><small>{{b.timeSlot}}</small></td>
                                <td>{{b.patientDetails}}</td>
                                <td>
                                    <span class="status-badge" [ngClass]="b.status.toLowerCase()">{{b.status}}</span>
                                    <div *ngIf="b.tokenNumber" style="font-size: 0.8rem; margin-top: 4px;">Token: {{b.tokenNumber}}</div>
                                </td>
                                <td>
                                    <div class="action-buttons" *ngIf="b.status === 'Pending'">
                                        <button (click)="openUpdateModal(b, 'Approve')" class="btn btn-sm btn-success">Approve</button>
                                        <button (click)="openUpdateModal(b, 'Reschedule')" class="btn btn-sm btn-warning">Reschedule</button>
                                        <button (click)="openUpdateModal(b, 'Reject')" class="btn btn-sm btn-danger">Reject</button>
                                    </div>
                                    <div *ngIf="b.status !== 'Pending'" class="text-muted" style="font-size: 0.85rem">
                                        No actions available
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                     <div class="text-muted text-center py-4" *ngIf="allBookings.length === 0">No OP booking requests found.</div>
                </div>
             </div>
        </ng-container>

        <!-- Admin Update Modal -->
        <div class="modal-overlay" *ngIf="showModal">
            <div class="modal shadow">
                <h3>{{updatingAction}} Booking</h3>
                <p>For {{selectedBooking?.User?.name}} at {{selectedBooking?.hospital}}</p>
                
                <div class="form-group" *ngIf="updatingAction === 'Approve'">
                    <label>Assign Token Number</label>
                    <input type="text" [(ngModel)]="updateData.tokenNumber" class="form-control" placeholder="E.g. T-105">
                </div>

                <div class="form-group" *ngIf="updatingAction === 'Reject'">
                    <label>Reason for Rejection</label>
                    <textarea [(ngModel)]="updateData.rejectionReason" class="form-control" rows="2"></textarea>
                </div>

                <div class="form-group" *ngIf="updatingAction === 'Reschedule'">
                    <label>New Time Slot (or Date instructions)</label>
                    <input type="text" [(ngModel)]="updateData.timeSlot" class="form-control" placeholder="E.g. Postponed to 04:00 PM">
                </div>

                <div class="modal-actions">
                    <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
                    <button class="btn btn-primary" (click)="submitUpdate()">Confirm {{updatingAction}}</button>
                </div>
            </div>
        </div>

    </div>
  `,
    styles: [`
    /* Minimal Aesthetic Base */
    .fade-in { animation: fadeIn 0.4s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .booking-container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
    .section-header { text-align: center; margin-bottom: 2rem; }
    .section-header h1 { font-size: 2.2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
    .section-header p { color: #64748b; font-size: 1.1rem; }
    
    .shadow { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #334155; font-size: 0.95rem; }
    .form-control { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; transition: all 0.2s; font-family: inherit; font-size: 1rem; }
    .form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
    
    .btn { padding: 0.5rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; border: none; transition: background-color 0.2s, transform 0.1s; display: inline-flex; align-items: center; justify-content: center; font-size: 0.95rem;}
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.85rem; border-radius: 4px; }
    .btn-outline-danger { background: transparent; border: 1px solid #ef4444; color: #ef4444; }
    .btn-outline-danger:hover { background: #ef4444; color: white; }
    .btn-success { background: #10b981; color: white; }
    .btn-success:hover { background: #059669; }
    .btn-warning { background: #f59e0b; color: white; }
    .btn-warning:hover { background: #d97706; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; }
    .btn-outline { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
    .btn-outline:hover { background: #f8fafc; color: #1e293b; }

    .text-muted { color: #64748b; }
    .text-success { color: #10b981; }
    .text-danger { color: #ef4444; }

    /* Layout Grids */
    .booking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    @media (max-width: 900px) { .booking-grid { grid-template-columns: 1fr; } }
    
    .booking-card { background: white; border-radius: 12px; padding: 1.5rem; }
    .booking-card h2 { font-size: 1.25rem; color: #0f172a; margin-bottom: 1.5rem; font-weight: 600; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }

    /* Appointments List */
    .appointments-list { display: flex; flex-direction: column; gap: 1rem; max-height: 500px; overflow-y: auto; padding-right: 0.5rem; }
    .appointments-list::-webkit-scrollbar { width: 6px; }
    .appointments-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    
    .appointment-item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; transition: border-color 0.2s; }
    .appointment-item:hover { border-color: #cbd5e1; }
    .apt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .apt-dept { font-weight: 600; color: #1e293b; }
    .apt-body p { margin-bottom: 0.35rem; color: #475569; font-size: 0.95rem; }
    .apt-body strong { color: #1e293b; }
    .apt-actions { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed #e2e8f0; display: flex; justify-content: flex-end; }
    
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.pending { background: #fef3c7; color: #d97706; }
    .status-badge.approved { background: #d1fae5; color: #059669; }
    .status-badge.rejected { background: #fee2e2; color: #dc2626; }
    
    /* Admin View */
    .admin-panel { background: white; border-radius: 12px; padding: 1.5rem; overflow: hidden; }
    .table-responsive { overflow-x: auto; }
    .modern-table { width: 100%; border-collapse: collapse; text-align: left; }
    .modern-table th { background: #f8fafc; padding: 1rem; color: #475569; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
    .modern-table td { padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
    .modern-table tr:last-child td { border-bottom: none; }
    .modern-table tr:hover td { background: #f8fafc; }
    .action-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
    .modal { background: white; width: 90%; max-width: 450px; border-radius: 12px; padding: 2rem; position: relative; }
    .modal h3 { margin-bottom: 0.5rem; color: #0f172a; font-size: 1.25rem; }
    .modal p { color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
  `]
})
export class OpBookingComponent implements OnInit {
    healthService = inject(HealthService);
    authService = inject(AuthService);
    toast = inject(ToastService);

    isHealthWorker = false;

    // Citizen State
    newBooking = {
        hospital: '',
        department: '',
        date: '',
        timeSlot: '09:00 AM - 11:00 AM',
        patientDetails: ''
    };
    myBookings: any[] = [];

    // Health Worker State
    allBookings: any[] = [];
    showModal = false;
    selectedBooking: any = null;
    updatingAction: 'Approve' | 'Reject' | 'Reschedule' = 'Approve';
    updateData = {
        status: '',
        tokenNumber: '',
        rejectionReason: '',
        timeSlot: ''
    };

    ngOnInit() {
        this.isHealthWorker = this.authService.hasRole('Health Worker');
        if (this.isHealthWorker) {
            this.loadAllBookings();
        } else {
            this.loadMyBookings();
        }
    }

    // --- Citizen Methods ---
    loadMyBookings() {
        this.healthService.getMyOpBookings().subscribe({
            next: (res) => this.myBookings = res,
            error: (err) => this.toast.showError('Failed to load appointments')
        });
    }

    bookAppointment() {
        this.healthService.createOpBooking(this.newBooking).subscribe({
            next: (res) => {
                this.toast.showSuccess('OP Ticket Booking requested successfully');
                this.newBooking = { hospital: '', department: '', date: '', timeSlot: '09:00 AM - 11:00 AM', patientDetails: '' };
                this.loadMyBookings();
            },
            error: (err) => this.toast.showError('Failed to book appointment')
        });
    }

    cancelBooking(id: number) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            this.healthService.cancelOpBooking(id).subscribe({
                next: () => {
                    this.toast.showSuccess('Booking cancelled');
                    this.loadMyBookings();
                },
                error: () => this.toast.showError('Failed to cancel booking')
            });
        }
    }

    // --- Health Worker Methods ---
    loadAllBookings() {
        this.healthService.getAllOpBookings().subscribe({
            next: (res) => this.allBookings = res,
            error: (err) => this.toast.showError('Failed to load OP requests')
        });
    }

    openUpdateModal(booking: any, action: 'Approve' | 'Reject' | 'Reschedule') {
        this.selectedBooking = booking;
        this.updatingAction = action;
        this.updateData = { status: '', tokenNumber: '', rejectionReason: '', timeSlot: booking.timeSlot };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.selectedBooking = null;
    }

    submitUpdate() {
        if (!this.selectedBooking) return;

        let payload: any = { status: '' };

        if (this.updatingAction === 'Approve') {
            payload.status = 'Approved';
            payload.tokenNumber = this.updateData.tokenNumber;
            if (!payload.tokenNumber) return this.toast.showError('Token number is required to approve');
        } else if (this.updatingAction === 'Reject') {
            payload.status = 'Rejected';
            payload.rejectionReason = this.updateData.rejectionReason;
            if (!payload.rejectionReason) return this.toast.showError('Rejection reason is required');
        } else if (this.updatingAction === 'Reschedule') {
            // we'll keep status as pending or we can mark it as approved with new time slot. 
            // the requirements say "Reschedule", usually involves changing timeSlot.
            payload.status = 'Pending';
            payload.timeSlot = this.updateData.timeSlot;
            payload.rejectionReason = 'Rescheduled to new time slot. Please check Details.';
        }

        this.healthService.updateOpBookingStatus(this.selectedBooking.id, payload).subscribe({
            next: () => {
                this.toast.showSuccess(`Booking ${this.updatingAction.toLowerCase()}d successfully`);
                this.closeModal();
                this.loadAllBookings();
            },
            error: () => this.toast.showError('Failed to update booking')
        });
    }
}

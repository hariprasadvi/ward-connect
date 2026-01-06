import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../../core/services/complaint.service';
import { Complaint, ComplaintStatus } from '../../../core/models/complaint.model';
import { MessageService } from '../../../../../services/message.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-manage-complaints',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './manage-complaints.component.html',
  styleUrls: ['./manage-complaints.component.css']
})
export class ManageComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'userName', 'title', 'category', 'status', 'actions'];
  
  selectedComplaint: Complaint | null = null;
  staffName = '';
  adminResponse = '';
  announcementMessage = '';
  isBroadcasting = false;
  selectedStatus: ComplaintStatus | null = null;

  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  constructor(
    private complaintService: ComplaintService,
    private snackBar: MatSnackBar,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.complaintService.getAllComplaints().subscribe({
      next: (complaints) => {
        this.complaints = complaints;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectComplaint(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.staffName = complaint.assignedStaff || '';
    this.adminResponse = complaint.adminResponse || '';
    this.selectedStatus = complaint.status;
  }

  assignStaff(): void {
    if (!this.selectedComplaint || !this.staffName.trim()) {
      return;
    }

    this.complaintService.assignStaff(this.selectedComplaint.id, this.staffName).subscribe({
      next: () => {
        this.snackBar.open('Staff assigned successfully', 'Close', { duration: 3000 });
        this.loadComplaints();
        this.selectedComplaint = null;
        this.staffName = '';
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to assign staff', 'Close', { duration: 3000 });
      }
    });
  }

  updateStatus(): void {
    if (!this.selectedComplaint || !this.selectedStatus) {
      return;
    }

    this.complaintService.updateStatus(this.selectedComplaint.id, this.selectedStatus, this.adminResponse).subscribe({
      next: () => {
        this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
        this.loadComplaints();
        this.selectedComplaint = null;
        this.selectedStatus = null;
        this.adminResponse = '';
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  sendAnnouncement(): void {
    if (!this.selectedComplaint || !this.announcementMessage.trim()) return;

    this.isBroadcasting = true;
    const complaint = this.selectedComplaint as any;
    const houseNumber = complaint.houseNumber || complaint.User?.house_number;
    
    if (!houseNumber) {
        this.snackBar.open('User has no house number associated', 'Close', { duration: 3000 });
        this.isBroadcasting = false;
        return;
    }

    this.messageService.broadcastMessage({
      houseNumber: houseNumber,
      message: this.announcementMessage,
      type: 'pickup-alert'
    }).subscribe({
      next: () => {
        this.snackBar.open('Announcement sent to House #' + houseNumber, 'Close', { duration: 3000 });
        this.announcementMessage = '';
        this.isBroadcasting = false;
      },
      error: () => {
        this.snackBar.open('Failed to send announcement', 'Close', { duration: 3000 });
        this.isBroadcasting = false;
      }
    });
  }

  deleteComplaint(complaintId: string): void {
    if (confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      this.complaintService.deleteComplaint(complaintId).subscribe({
        next: () => {
           this.snackBar.open('Complaint deleted successfully', 'Close', { duration: 3000 });
           // Remove from local list
           this.complaints = this.complaints.filter(c => c.id !== complaintId);
           // If the deleted one was selected, deselect it
           if (this.selectedComplaint && this.selectedComplaint.id === complaintId) {
             this.selectedComplaint = null;
           }
        },
        error: (err) => {
           console.error(err);
           this.snackBar.open('Failed to delete complaint', 'Close', { duration: 3000 });
        }
      });
    }
  }
}





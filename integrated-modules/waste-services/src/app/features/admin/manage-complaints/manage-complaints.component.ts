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
    MatSnackBarModule
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
  selectedStatus: ComplaintStatus | null = null;

  statusOptions = [
    { value: ComplaintStatus.PENDING, label: 'Pending' },
    { value: ComplaintStatus.ASSIGNED, label: 'Assigned' },
    { value: ComplaintStatus.IN_PROGRESS, label: 'In Progress' },
    { value: ComplaintStatus.RESOLVED, label: 'Resolved' },
    { value: ComplaintStatus.CLOSED, label: 'Closed' }
  ];

  constructor(
    private complaintService: ComplaintService,
    private snackBar: MatSnackBar
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

    this.complaintService.updateStatus(this.selectedComplaint.id, this.selectedStatus).subscribe({
      next: () => {
        this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
        this.loadComplaints();
        this.selectedComplaint = null;
        this.selectedStatus = null;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}

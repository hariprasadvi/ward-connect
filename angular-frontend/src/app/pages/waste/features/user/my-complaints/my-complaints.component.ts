import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { ComplaintService } from '../../../core/services/complaint.service';
import { Complaint } from '../../../core/models/complaint.model';

@Component({
  selector: 'app-my-complaints',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './my-complaints.component.html',
  styleUrls: ['./my-complaints.component.css']
})
export class MyComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  loading = true;
  displayedColumns: string[] = ['title', 'category', 'createdAt', 'status'];

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService
  ) {}

  ngOnInit(): void {
    const user: any = this.authService.currentUserValue;
    if (user) {
      this.loadComplaints(user.id);
    }
  }

  loadComplaints(userId: string): void {
    this.complaintService.getUserComplaints(userId).subscribe({
      next: (complaints) => {
        this.complaints = complaints;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}





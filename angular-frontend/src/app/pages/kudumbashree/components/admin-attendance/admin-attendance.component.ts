import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './admin-attendance.component.html',
  styleUrl: './admin-attendance.component.scss'
})
export class AdminAttendanceComponent implements OnInit {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  translations = this.translationService.translations$;

  meetings: any[] = [];
  selectedMeetingId: number | null = null;
  summary: any = null;
  adminCount: number | null = null;

  isLoadingMeetings = false;
  isLoadingSummary = false;
  isSubmitting = false;

  statusMessage = '';
  statusType: 'success' | 'error' | 'info' | '' = '';
  displayedColumns = ['name', 'email'];

  ngOnInit() {
    this.loadMeetings();
  }

  loadMeetings() {
    this.isLoadingMeetings = true;
    // Load all meetings (both active and history) to let admin manage any
    this.apiService.getMeetings('active').subscribe({
      next: (data) => {
        this.meetings = data;
        this.isLoadingMeetings = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingMeetings = false;
      }
    });
  }

  onMeetingChange() {
    this.summary = null;
    this.adminCount = null;
    this.statusMessage = '';
    this.statusType = '';
    if (this.selectedMeetingId) {
      this.loadSummary();
    }
  }

  loadSummary() {
    if (!this.selectedMeetingId) return;
    this.isLoadingSummary = true;
    this.apiService.getAttendanceSummary(this.selectedMeetingId).subscribe({
      next: (data) => {
        this.summary = data;
        this.isLoadingSummary = false;
        this.statusMessage = '';
      },
      error: (err) => {
        console.error(err);
        this.isLoadingSummary = false;
        this.statusMessage = 'Error loading attendance summary.';
        this.statusType = 'error';
      }
    });
  }

  refreshSummary() {
    this.loadSummary();
  }

  submitAttendance() {
    if (!this.selectedMeetingId || this.adminCount === null) return;

    this.isSubmitting = true;
    this.statusMessage = '';
    this.statusType = '';

    this.apiService.adminSubmitAttendance(this.selectedMeetingId, this.adminCount).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.statusMessage = res.message;
        this.statusType = 'success';
        // Refresh summary to reflect submitted state
        this.loadSummary();
        this.adminCount = null;
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Submission failed. Please try again.';
        this.statusMessage = msg;
        this.statusType = 'error';
        // Refresh to show latest actual count
        this.loadSummary();
      }
    });
  }

  get canSubmit(): boolean {
    return (
      this.selectedMeetingId !== null &&
      this.adminCount !== null &&
      this.adminCount >= 0 &&
      !this.isSubmitting &&
      !(this.summary?.attendance_submitted)
    );
  }

  get countMatchesActual(): boolean {
    return this.summary && this.adminCount !== null &&
      Number(this.adminCount) === Number(this.summary.presentCount);
  }
}

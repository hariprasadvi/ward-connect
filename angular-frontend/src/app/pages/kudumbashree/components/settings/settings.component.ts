import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { KudumbashreeMeeting } from '../../models/meeting';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  translations = this.translationService.translations$;

  meetings: KudumbashreeMeeting[] = [];
  selectedMeetingId: string | null = null;
  attendanceList: any[] = [];
  isLoading = false;
  isAttendanceLoading = false;

  displayedColumns: string[] = ['member', 'status', 'payment', 'time'];

  ngOnInit() {
    this.loadMeetings();
  }

  loadMeetings() {
    this.isLoading = true;
    this.apiService.getMeetings('active').subscribe({ // Or fetch all/history if needed
      next: (data) => {
        // Also fetch history to ensure we see past meetings where attendance was marked
        this.apiService.getMeetings('history').subscribe({
          next: (historyData) => {
             this.meetings = [...data, ...historyData].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             this.isLoading = false;
          },
          error: () => this.isLoading = false
        });
      },
      error: (err) => {
        console.error('Error loading meetings', err);
        this.isLoading = false;
      }
    });
  }

  onMeetingSelect(meetingId: string) {
    this.selectedMeetingId = meetingId;
    this.isAttendanceLoading = true;
    this.attendanceList = [];
    
    this.apiService.getAttendanceByMeeting(meetingId).subscribe({
      next: (data) => {
        this.attendanceList = data;
        this.isAttendanceLoading = false;
      },
      error: (err) => {
        console.error('Error loading attendance', err);
        this.isAttendanceLoading = false;
      }
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { Meeting } from '../../models';

@Component({
  selector: 'app-meeting-minutes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './meeting-minutes.component.html',
  styleUrl: './meeting-minutes.component.scss'
})
export class MeetingMinutesComponent implements OnInit {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);

  translations = this.translationService.translations$;

  isRecording = false;
  selectedMeeting: string = '';
  selectedMeetingDetails: Meeting | null = null;
  meetings: Meeting[] = [];
  transcript = '';
  summary = '';
  recordingTime = 0;
  private recordingInterval: any;

  // Sample meetings for demo
  private sampleMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Monthly Community Meeting',
      description: 'Regular monthly meeting to discuss community issues and updates',
      date: new Date('2024-01-15'),
      startTime: '10:00',
      endTime: '12:00',
      location: 'Community Hall',
      organizerId: 'admin1',
      organizerName: 'Community Coordinator',
      status: 'completed' as any,
      attendees: ['user1', 'user2', 'user3'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Loan Committee Review',
      description: 'Review of pending loan applications and disbursements',
      date: new Date('2024-01-20'),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Kudumbashree Office',
      organizerId: 'admin2',
      organizerName: 'Loan Officer',
      status: 'scheduled' as any,
      attendees: ['user4', 'user5'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  ngOnInit() {
    this.loadMeetings();
  }

  loadMeetings() {
    // For now, use sample data
    this.meetings = this.sampleMeetings;
  }

  onMeetingSelect() {
    if (this.selectedMeeting) {
      this.selectedMeetingDetails = this.meetings.find(m => m.id === this.selectedMeeting) || null;
    } else {
      this.selectedMeetingDetails = null;
    }
    this.transcript = '';
    this.summary = '';
  }

  startRecording() {
    if (!this.selectedMeeting) return;
    
    this.isRecording = true;
    this.recordingTime = 0;
    this.recordingInterval = setInterval(() => {
      this.recordingTime++;
    }, 1000);
    
    // Simulate recording process
    setTimeout(() => {
      if (this.isRecording) {
        this.stopRecording();
      }
    }, 10000);
  }

  stopRecording() {
    this.isRecording = false;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    // Simulate processing the recording
    this.simulateProcessing();
  }

  private simulateProcessing() {
    setTimeout(() => {
      const meetingTitle = this.selectedMeetingDetails?.title || 'Meeting';
      const meetingDate = this.selectedMeetingDetails?.date ? 
        new Date(this.selectedMeetingDetails.date).toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }) : 'Unknown Date';
      const meetingLocation = this.selectedMeetingDetails?.location || 'Unknown Location';

      this.transcript = `Meeting Transcript for: ${meetingTitle}\n\nDate: ${meetingDate}\nLocation: ${meetingLocation}\n\nSample transcript content...`;
      this.summary = `MEETING SUMMARY: ${meetingTitle}\n\nSample summary content...`;
    }, 2000);
  }

  generateSummary() {
    if (!this.selectedMeeting) return;
    
    this.apiService.getMeetingTranscript(this.selectedMeeting).subscribe({
      next: (response) => {
        this.transcript = response.transcript || this.transcript;
        this.summary = response.summary || this.summary;
      },
      error: (error) => {
        console.error('Error generating summary:', error);
        if (!this.transcript) {
          this.simulateProcessing();
        }
      }
    });
  }

  clearSelection() {
    this.selectedMeeting = '';
    this.selectedMeetingDetails = null;
    this.transcript = '';
    this.summary = '';
    if (this.isRecording) {
      this.stopRecording();
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
    });
  }

  downloadTranscript() {
    this.downloadFile(this.transcript, 'transcript.txt', 'text/plain');
  }

  downloadSummary() {
    this.downloadFile(this.summary, 'meeting-summary.txt', 'text/plain');
  }

  private downloadFile(content: string, filename: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
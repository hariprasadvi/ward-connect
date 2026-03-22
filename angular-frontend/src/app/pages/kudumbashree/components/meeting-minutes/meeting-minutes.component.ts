import { Component, OnInit, inject, NgZone } from '@angular/core';
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
import { KudumbashreeMeeting } from '../../models/meeting';

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
  selectedMeetingDetails: KudumbashreeMeeting | null = null;
  meetings: KudumbashreeMeeting[] = [];
  transcript = '';
  summary = '';
  recordingTime = 0;
  private recordingInterval: any;

  // Sample meetings for demo - Removed to avoid type issues and unused code
  // private sampleMeetings: KudumbashreeMeeting[] = [];

  ngOnInit() {
    this.loadMeetings();
  }

  loadMeetings() {
    this.apiService.getMeetings().subscribe({
      next: (meetings) => {
        this.meetings = meetings;
      },
      error: (error) => console.error('Error fetching meetings:', error)
    });
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

  mediaRecorder: MediaRecorder | null = null;
  audioChunks: any[] = [];

  interimTranscript = '';
  ws: WebSocket | null = null;

  constructor(private ngZone: NgZone) { } // Inject NgZone

  async startRecording() {
    if (!this.selectedMeeting) return;

    try {
      // 1. Start Voice Recording (for backend upload)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.uploadAudio(audioBlob, this.transcript);
        stream.getTracks().forEach(track => track.stop());
      };

      // 2. Start Live Speech Recognition via WebSocket
      // Assuming backend is playing on localhost:5000/api/kudumbashree/meeting/livestream
      // We read the port from an environment or hardcoded for now
      this.ws = new WebSocket('ws://localhost:5000/api/kudumbashree/meeting/livestream');

      this.ws.onopen = () => {
        console.log('WebSocket connection opened');
        // Tell backend to start Google Speech recognition
        this.ws?.send(JSON.stringify({
          action: 'start',
          sampleRate: this.mediaRecorder?.stream.getAudioTracks()[0].getSettings().sampleRate || 48000,
          encoding: 'WEBM_OPUS' // Ensure your nodejs API uses WEBM_OPUS (which fits browser's webm)
        }));
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error("Speech API Error:", data.error);
          this.interimTranscript = "Error: " + data.error;
          return;
        }

        this.ngZone.run(() => {
          if (data.isFinal) {
            this.transcript += data.transcript + ' ';
            this.interimTranscript = '';
          } else {
            this.interimTranscript = data.transcript;
          }
        });
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(event.data); // Send blob chunks to WebSocket
        }
        if (event.data.size > 0) {
          this.audioChunks.push(event.data); // Keep appending for the final upload
        }
      };

      // Request chunks every 250ms for real-time effect
      this.mediaRecorder.start(250);

      this.isRecording = true;
      this.recordingTime = 0;

      this.recordingInterval = setInterval(() => {
        this.recordingTime++;
      }, 1000);

    } catch (error: any) {
      console.error('Error starting recording:', error);
      alert('Error starting recording: ' + (error.message || 'Please check microphone permissions.'));
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }

    if (this.ws) {
      this.ws.send(JSON.stringify({ action: 'stop' }));
      this.ws.close();
      this.ws = null;
    }

    this.interimTranscript = ''; // Clear interim text

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  uploadAudio(blob: Blob, currentTranscript: string = '') {
    if (!this.selectedMeeting) return;

    this.transcript = currentTranscript; // Preserve the current transcript instead of overwriting it
    this.summary = 'Processing summary with AI...';

    this.apiService.recordMeetingAudio(this.selectedMeeting, blob, currentTranscript).subscribe({
      next: (response) => {
        console.log('Upload successful', response);
        this.pollStatus(this.selectedMeeting);
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.transcript = currentTranscript + '\n\nUpload failed. ' + (error.error?.message || error.message);
        this.summary = 'Upload failed.';
      }
    });
  }

  pollStatus(meetingId: string) {
    this.summary = 'Processing summary... (Please wait)';

    const pollInterval = setInterval(() => {
      this.apiService.getProcessingStatus(meetingId).subscribe({
        next: (status) => {
          console.log('Processing Status:', status.processingStatus);
          if (status.processingStatus === 'COMPLETED') {
            clearInterval(pollInterval);
            this.transcript = status.transcript;
            this.summary = status.summary;
          } else if (status.processingStatus === 'FAILED') {
            clearInterval(pollInterval);
            this.transcript = 'Processing Failed.';
            this.summary = 'Processing Failed.';
          }
        },
        error: (err) => {
          console.error('Polling error:', err);
          clearInterval(pollInterval);
          this.transcript = 'Polling Error.';
        }
      });
    }, 5000);
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
    this.downloadFile(this.summary, 'KudumbashreeMeeting-summary.txt', 'text/plain');
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

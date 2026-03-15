import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
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
import { io } from 'socket.io-client';

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
  interimTranscript = '';
  summary = '';
  recordingTime = 0;
  private recordingInterval: any;
  private socket: any;

  constructor(private ngZone: NgZone) {} // Inject NgZone

  ngOnInit() {
    this.loadMeetings();
    this.initSocket();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.stopRecording();
  }

  initSocket() {
    this.socket = io('http://localhost:5000');

    this.socket.on('interimTranscript', (data: any) => {
      this.ngZone.run(() => {
        // We receive the chunk translation, append to final transcript
        this.transcript += (this.transcript ? ' ' : '') + data.transcript;
        this.interimTranscript = ''; // clear interim once a chunk is finalized
      });
    });

    this.socket.on('processingStatus', (data: any) => {
      this.ngZone.run(() => {
        this.summary = data.message;
      });
    });

    this.socket.on('finalTranscription', (data: any) => {
      this.ngZone.run(() => {
        this.transcript = data.transcript;
        this.summary = data.summary;
      });
    });

    this.socket.on('transcriptionError', (data: any) => {
      this.ngZone.run(() => {
        this.summary = data.message;
      });
    });
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
  recognition: any = null;
  audioChunks: any[] = [];

  async startRecording() {
    if (!this.selectedMeeting) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          // Send chunk to backend via WebSocket
          this.socket.emit('audioChunk', {
            audio: event.data,
            mimeType: this.mediaRecorder?.mimeType || 'audio/webm'
          });
        }
      };

      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      // Emit start to backend
      this.socket.emit('startRecording', { meetingId: this.selectedMeeting });

      // Start browser realtime speech recognition for immediate interim feedback "while speaking"
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new (window as any).webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ml-IN';

        this.recognition.onresult = (event: any) => {
          this.ngZone.run(() => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (!event.results[i].isFinal) {
                interim += event.results[i][0].transcript;
              }
            }
            this.interimTranscript = interim;
          });
        };
        this.recognition.start();
      }

      // Start recording, emit chunks every 15 seconds (15000ms) to respect free-tier max of 5 Req/Min
      this.mediaRecorder.start(15000);

      this.isRecording = true;
      this.recordingTime = 0;
      this.transcript = 'Listening...';
      this.summary = '';
      
      this.recordingInterval = setInterval(() => {
        this.recordingTime++;
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please allow permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.socket.emit('stopRecording');
    }

    if (this.recognition) {
      this.recognition.stop();
    }

    this.interimTranscript = ''; // Clear interim text

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  uploadAudio(blob: Blob) {
    if (!this.selectedMeeting) return;

    this.transcript = 'Uploading...';
    this.summary = 'Waiting for upload...';

    this.apiService.recordMeetingAudio(this.selectedMeeting, blob).subscribe({
      next: (response) => {
        console.log('Upload response', response);

        if (response.warning) {
          this.transcript = 'Audio saved. ' + response.message;
          this.summary = 'AI Service Unavailable (Redis down).';
          alert(response.message);
        } else {
          this.pollStatus(this.selectedMeeting);
        }
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.transcript = 'Upload failed. ' + (error.error?.message || error.message);
        this.summary = 'Upload failed.';
      }
    });
  }

  pollStatus(meetingId: string) {
    this.transcript = 'Processing... (Please wait)';
    this.summary = 'Processing...';

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
    this.interimTranscript = '';
    this.summary = '';
    if (this.isRecording) {
      this.stopRecording();
    }
    if (this.recognition) {
      this.recognition.stop();
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

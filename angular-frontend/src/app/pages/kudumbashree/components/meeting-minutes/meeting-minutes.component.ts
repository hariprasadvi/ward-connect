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

// Extend Window to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

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
export class MeetingMinutesComponent implements OnInit, OnDestroy {
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

  // Voice recognition
  interimTranscript = '';
  selectedLanguage: string = 'ml-IN'; // Default Malayalam
  private recognition: any = null;
  isSpeechSupported = false;

  // Audio recording for backend upload
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: any[] = [];
  private audioStream: MediaStream | null = null;

  // Available languages for speech recognition
  languages = [
    { code: 'ml-IN', label: 'മലയാളം (Malayalam)' },
    { code: 'en-IN', label: 'English (India)' },
    { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
    { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  ];

  constructor(private ngZone: NgZone) {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSpeechSupported = !!SpeechRecognition;
  }

  ngOnInit() {
    this.loadMeetings();
  }

  ngOnDestroy() {
    this.cleanupRecording();
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
    this.interimTranscript = '';
  }

  async startRecording() {
    if (!this.selectedMeeting) return;

    if (!this.isSpeechSupported) {
      alert('Your browser does not support Speech Recognition. Please use Google Chrome.');
      return;
    }

    try {
      // 1. Start audio capture for backend upload
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.audioStream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.uploadAudio(audioBlob, this.transcript);
        // Stop all tracks
        if (this.audioStream) {
          this.audioStream.getTracks().forEach(track => track.stop());
          this.audioStream = null;
        }
      };

      this.mediaRecorder.start(1000); // Collect chunks every second

      // 2. Start Web Speech API for real-time transcription
      this.startSpeechRecognition();

      this.isRecording = true;
      this.recordingTime = 0;

      this.recordingInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.recordingTime++;
        });
      }, 1000);

    } catch (error: any) {
      console.error('Error starting recording:', error);
      alert('Error starting recording: ' + (error.message || 'Please check microphone permissions.'));
    }
  }

  private startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure for real-time continuous recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.selectedLanguage;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      this.ngZone.run(() => {
        let interim = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalText += text + ' ';
          } else {
            interim += text;
          }
        }

        if (finalText) {
          this.transcript += finalText;
        }
        this.interimTranscript = interim;
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      // Auto-restart on certain recoverable errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are normal — just keep going
        if (this.isRecording) {
          setTimeout(() => this.restartRecognition(), 200);
        }
      } else if (event.error === 'network') {
        this.ngZone.run(() => {
          this.interimTranscript = '⚠️ Network error. Trying to reconnect...';
        });
        if (this.isRecording) {
          setTimeout(() => this.restartRecognition(), 1000);
        }
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if still recording (Web Speech API auto-stops after silence)
      if (this.isRecording) {
        setTimeout(() => this.restartRecognition(), 100);
      }
    };

    this.recognition.start();
    console.log('Speech recognition started with language:', this.selectedLanguage);
  }

  private restartRecognition() {
    if (!this.isRecording) return;

    try {
      if (this.recognition) {
        this.recognition.stop();
      }
    } catch (e) {
      // Ignore errors when stopping
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.selectedLanguage;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          let interim = '';
          let finalText = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript;

            if (result.isFinal) {
              finalText += text + ' ';
            } else {
              interim += text;
            }
          }

          if (finalText) {
            this.transcript += finalText;
          }
          this.interimTranscript = interim;
        });
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          if (this.isRecording) {
            setTimeout(() => this.restartRecognition(), 200);
          }
        } else if (event.error === 'network') {
          this.ngZone.run(() => {
            this.interimTranscript = '⚠️ Network error. Trying to reconnect...';
          });
          if (this.isRecording) {
            setTimeout(() => this.restartRecognition(), 1000);
          }
        }
      };

      this.recognition.onend = () => {
        if (this.isRecording) {
          setTimeout(() => this.restartRecognition(), 100);
        }
      };

      this.recognition.start();
    } catch (e) {
      console.error('Error restarting recognition:', e);
      if (this.isRecording) {
        setTimeout(() => this.restartRecognition(), 500);
      }
    }
  }

  stopRecording() {
    this.isRecording = false;

    // Stop speech recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) { /* ignore */ }
      this.recognition = null;
    }

    // Stop media recorder (triggers onstop which uploads audio)
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    this.interimTranscript = '';

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  private cleanupRecording() {
    this.isRecording = false;

    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) { /* ignore */ }
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch (e) { /* ignore */ }
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  uploadAudio(blob: Blob, currentTranscript: string = '') {
    if (!this.selectedMeeting) return;

    this.transcript = currentTranscript;
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
    this.interimTranscript = '';
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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { KudumbashreeMeeting } from '../../models/meeting';

// Extend Window for Web Speech API
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
    MatTooltipModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  templateUrl: './meeting-minutes.component.html',
  styleUrl: './meeting-minutes.component.scss'
})
export class MeetingMinutesComponent implements OnInit {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);

  translations = this.translationService.translations$;

  // Meeting selection
  selectedMeeting: string = '';
  selectedMeetingDetails: KudumbashreeMeeting | null = null;
  meetings: KudumbashreeMeeting[] = [];

  // Results
  transcript = '';
  summary = '';

  // Upload state
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  isProcessing = false;
  uploadProgress = 0;
  processingStatus = '';

  // Live recording state
  isRecording = false;
  recordingTime = 0;
  interimTranscript = '';
  selectedLanguage = 'ml-IN';
  private recognition: any = null;
  isSpeechSupported = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: any[] = [];
  private audioStream: MediaStream | null = null;
  private recordingInterval: any;

  languages = [
    { code: 'ml-IN', label: 'മലയാളം (Malayalam)' },
    { code: 'en-IN', label: 'English (India)' },
    { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
    { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  ];

  constructor(private ngZone: NgZone) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSpeechSupported = !!SpeechRecognition;
  }

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
    this.resetResults();
  }

  // ===== FILE UPLOAD =====

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File) {
    // Validate audio file
    const allowedTypes = [
      'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm',
      'audio/ogg', 'audio/mp4', 'audio/m4a', 'audio/x-m4a',
      'audio/aac', 'audio/flac', 'video/mp4', 'video/webm'
    ];

    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/') && !allowedTypes.includes(file.type)) {
      alert('Please select a valid audio file (MP3, WAV, M4A, WebM, OGG, AAC, FLAC)');
      return;
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    this.selectedFile = file;
  }

  removeFile() {
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  uploadAndProcess() {
    if (!this.selectedFile || !this.selectedMeeting) return;

    this.isUploading = true;
    this.isProcessing = false;
    this.uploadProgress = 0;
    this.transcript = '';
    this.summary = '';
    this.processingStatus = 'Uploading audio file...';

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 300);

    this.apiService.recordMeetingAudio(this.selectedMeeting, this.selectedFile, '').subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.isUploading = false;
        this.isProcessing = true;
        this.processingStatus = 'AI is transcribing and generating minutes...';

        // Start polling for results
        this.pollStatus(this.selectedMeeting);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.isProcessing = false;
        this.processingStatus = '';
        console.error('Upload failed:', error);
        alert('Upload failed: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  pollStatus(meetingId: string) {
    const pollInterval = setInterval(() => {
      this.apiService.getProcessingStatus(meetingId).subscribe({
        next: (status) => {
          if (status.processingStatus === 'COMPLETED') {
            clearInterval(pollInterval);
            this.isProcessing = false;
            this.processingStatus = '';
            this.transcript = status.transcript || '';
            this.summary = status.summary || '';
          } else if (status.processingStatus === 'FAILED') {
            clearInterval(pollInterval);
            this.isProcessing = false;
            this.processingStatus = '';
            // Show the error message from backend if available
            this.summary = status.summary || 'AI processing failed. Please try again.';
            this.transcript = status.transcript || '';
          } else {
            this.processingStatus = 'AI is processing your audio... Please wait.';
          }
        },
        error: (err) => {
          console.error('Polling error:', err);
          clearInterval(pollInterval);
          this.isProcessing = false;
          this.processingStatus = '';
        }
      });
    }, 4000);
  }

  // ===== LIVE RECORDING =====

  async startRecording() {
    if (!this.selectedMeeting || !this.isSpeechSupported) return;

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.audioStream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        // Auto-upload after stopping
        this.uploadRecordedAudio(audioBlob);
        if (this.audioStream) {
          this.audioStream.getTracks().forEach(track => track.stop());
          this.audioStream = null;
        }
      };

      this.mediaRecorder.start(1000);
      this.startSpeechRecognition();

      this.isRecording = true;
      this.recordingTime = 0;
      this.recordingInterval = setInterval(() => {
        this.ngZone.run(() => { this.recordingTime++; });
      }, 1000);

    } catch (error: any) {
      alert('Microphone error: ' + (error.message || 'Check permissions'));
    }
  }

  private startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.selectedLanguage;

    this.recognition.onresult = (event: any) => {
      this.ngZone.run(() => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += text + ' ';
          } else {
            interim += text;
          }
        }
        if (finalText) this.transcript += finalText;
        this.interimTranscript = interim;
      });
    };

    this.recognition.onerror = (event: any) => {
      if ((event.error === 'no-speech' || event.error === 'aborted') && this.isRecording) {
        setTimeout(() => this.restartRecognition(), 200);
      }
    };

    this.recognition.onend = () => {
      if (this.isRecording) setTimeout(() => this.restartRecognition(), 100);
    };

    this.recognition.start();
  }

  private restartRecognition() {
    if (!this.isRecording) return;
    try { this.recognition?.stop(); } catch (e) { }
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SR();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.selectedLanguage;
      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          let interim = '', finalText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalText += text + ' ';
            else interim += text;
          }
          if (finalText) this.transcript += finalText;
          this.interimTranscript = interim;
        });
      };
      this.recognition.onerror = (e: any) => {
        if ((e.error === 'no-speech' || e.error === 'aborted') && this.isRecording)
          setTimeout(() => this.restartRecognition(), 200);
      };
      this.recognition.onend = () => {
        if (this.isRecording) setTimeout(() => this.restartRecognition(), 100);
      };
      this.recognition.start();
    } catch (e) {
      if (this.isRecording) setTimeout(() => this.restartRecognition(), 500);
    }
  }

  stopRecording() {
    this.isRecording = false;
    try { this.recognition?.stop(); } catch (e) { }
    this.recognition = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.interimTranscript = '';
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  private uploadRecordedAudio(blob: Blob) {
    if (!this.selectedMeeting) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.processingStatus = 'Uploading recorded audio...';

    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) this.uploadProgress += 15;
    }, 300);

    this.apiService.recordMeetingAudio(this.selectedMeeting, blob, this.transcript).subscribe({
      next: () => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.isUploading = false;
        this.isProcessing = true;
        this.processingStatus = 'AI is generating meeting minutes...';
        this.pollStatus(this.selectedMeeting);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.processingStatus = '';
        console.error('Upload failed:', error);
      }
    });
  }

  // ===== RESULTS =====

  generateSummary() {
    if (!this.selectedMeeting) return;
    this.apiService.getMeetingTranscript(this.selectedMeeting).subscribe({
      next: (response) => {
        this.transcript = response.transcript || this.transcript;
        this.summary = response.summary || this.summary;
      },
      error: (error) => console.error('Error generating summary:', error)
    });
  }

  clearSelection() {
    this.selectedMeeting = '';
    this.selectedMeetingDetails = null;
    this.resetResults();
    if (this.isRecording) this.stopRecording();
  }

  private resetResults() {
    this.transcript = '';
    this.summary = '';
    this.selectedFile = null;
    this.isUploading = false;
    this.isProcessing = false;
    this.processingStatus = '';
    this.uploadProgress = 0;
    this.interimTranscript = '';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied');
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

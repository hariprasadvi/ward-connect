import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import * as faceapi from 'face-api.js';

import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

declare var Razorpay: any;

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  translations = this.translationService.translations$;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  
  currentLocation: any = null;
  isScanning = false;
  isProcessingPayment = false;
  attendanceStatus = '';
  attendanceFee = this.paymentService.getAttendanceFee();
  scanningMessage = 'Loading Face Models...';
  
  activeMeetings: any[] = [];
  meetingHistory: any[] = [];
  selectedMeetingId: number | null = null;
  
  private stream: MediaStream | null = null;
  private detectionInterval: any;
  private modelsLoaded = false;
  private labeledFaceDescriptors: faceapi.LabeledFaceDescriptors | null = null;

  async ngOnInit() {
      await this.loadModels();
      this.loadMeetings();
      this.loadHistory();
      
      // Check for meeting ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const meetingId = urlParams.get('meetingId');
      if (meetingId) {
          this.selectedMeetingId = +meetingId;
      }
  }

  loadMeetings() {
      this.apiService.getMeetings('active').subscribe(meetings => {
          this.activeMeetings = meetings;
      });
  }

  loadHistory() {
      this.apiService.getAttendanceHistory().subscribe(meetings => {
          this.meetingHistory = meetings;
      });
  }

  ngOnDestroy() {
     this.stopScanning();
  }

  async loadModels() {
    try {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      ]);
      this.modelsLoaded = true;
      console.log('Face API Models Loaded');
    } catch (err) {
      console.error('Error loading face-api models', err);
      this.attendanceStatus = 'Error loading face recognition models. Check internet connection.';
    }
  }

  async loadUserProfileFace() {
    const user = this.authService.user();
    if (!user || !user.profile_image) {
        throw new Error('No profile image found. Please update your profile with a clear photo first.');
    }

    // Load image from URL
    const img = await faceapi.fetchImage(user.profile_image);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
        throw new Error('Could not detect a face in your profile picture. Please update it.');
    }

    // Create a labeled descriptor
    return new faceapi.LabeledFaceDescriptors(user.name, [detection.descriptor]);
  }

  async markAttendance() {
    if (!this.selectedMeetingId) {
        this.attendanceStatus = 'Please select a meeting first.';
        return;
    }
    try {
      this.isScanning = true;
      this.attendanceStatus = '';
      
      if (!this.modelsLoaded) {
         this.scanningMessage = 'Waiting for models to load...';
         await this.loadModels();
      }

      // Step 0: Load User Reference Face
      this.scanningMessage = 'Loading your profile data...';
      try {
        this.labeledFaceDescriptors = await this.loadUserProfileFace();
      } catch (err: any) {
         this.attendanceStatus = err.message;
         this.isScanning = false;
         return;
      }
      
      // Step 1: Get location (Start concurrently)
      this.scanningMessage = 'Acquiring Location...';
      this.currentLocation = null;
      this.getCurrentLocation().then(loc => {
          this.currentLocation = loc;
          console.log('Location acquired', loc);
      }).catch(err => {
          console.error('Location error', err);
      });

      // Step 2: Start Camera
      await this.startVideo();
      
    } catch (error) {
       this.handleError(error);
    }
  }

  async startVideo() {
      this.scanningMessage = 'Starting Camera...';
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        
        // Wait for view element to apply provided by @if details
        setTimeout(() => {
            if (this.videoElement) {
                this.videoElement.nativeElement.srcObject = this.stream;
                
                this.videoElement.nativeElement.onloadedmetadata = () => {
                   this.videoElement.nativeElement.play();
                   this.scanningMessage = 'Look at the camera...';
                   this.detectFaces();
                };
            }
        }, 100);

      } catch (err) {
         this.handleError('Camera access denied or not available.');
      }
  }

  detectFaces() {
      if (!this.videoElement || !this.canvasElement) return;
      
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      
      faceapi.matchDimensions(canvas, displaySize);

      if (!this.labeledFaceDescriptors) return;
      const faceMatcher = new faceapi.FaceMatcher(this.labeledFaceDescriptors, 0.6);

      this.detectionInterval = setInterval(async () => {
          if (!this.videoElement) return;

          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();
          
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          // Clear canvas
          const context = canvas.getContext('2d');
          context?.clearRect(0, 0, canvas.width, canvas.height);

          faceapi.draw.drawDetections(canvas, resizedDetections);
          
          if (resizedDetections.length > 0) {
              const bestMatch = faceMatcher.findBestMatch(resizedDetections[0].descriptor);
              
              if (bestMatch.label !== 'unknown') {
                  this.scanningMessage = `Identity Verified: ${bestMatch.label} (${Math.round((1 - bestMatch.distance) * 100)}%)`;
                  
                  // SUCCESS!
                  // Check if location is also ready
                  if (this.currentLocation) {
                       clearInterval(this.detectionInterval);
                       setTimeout(() => this.processPayment(), 1000); // Small delay to show success
                  } else {
                       this.scanningMessage = 'Face Verified! Waiting for Location...';
                  }
              } else {
                  this.scanningMessage = 'Face Not Recognized. Please move closer or adjust lighting.';
              }
          }
      }, 500);
  }

  stopScanning() {
      this.isScanning = false;
      if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
      }
      if (this.detectionInterval) {
          clearInterval(this.detectionInterval);
      }
  }


  private async processPayment() {
    this.stopScanning();
    this.isProcessingPayment = true;
    
    // Get meeting ID
    const meetingId = this.selectedMeetingId;

    if (!meetingId) {
        this.attendanceStatus = 'No meeting selected.';
        this.isProcessingPayment = false;
        return;
    }
    
    const user = this.authService.user();

    const selectedMeeting = this.activeMeetings.find(m => m.id === meetingId);

    const attendanceData = {
      location: this.currentLocation,
      latitude: this.currentLocation.latitude,
      longitude: this.currentLocation.longitude,
      timestamp: new Date(),
      faceVerified: true,
      meetingTitle: 'Meeting Attendance', 
      meetingId: meetingId,
      groupId: selectedMeeting?.groupId,
      userId: user?.id,
      userName: user?.name
    };

    try {
      // Step 1: Create Order via Service
      const paymentOrder = await this.paymentService.recordAttendancePayment(attendanceData);
      
      if (paymentOrder.success && paymentOrder.orderId) {
          
          const options = {
              "key": paymentOrder.key, 
              "amount": paymentOrder.amount, 
              "currency": "INR",
              "name": "Kudumbashree",
              "description": "Attendance Fee",
              // "image": "/assets/logo.png", // specific logo removed to avoid Mixed Content error on localhost
              "order_id": paymentOrder.orderId, 
              "handler": (response: any) => {
                  this.verifyPayment(response, attendanceData);
              },
              "prefill": {
                  "name": user?.name,
                  "email": user?.email,
                  "contact": user?.phone
              },
              "theme": {
                  "color": "#3399cc"
              }
          };
          
          const rzp1 = new Razorpay(options);
          rzp1.on('payment.failed', (response: any) => {
              this.attendanceStatus = 'Payment Failed: ' + response.error.description;
              this.isProcessingPayment = false;
          });
          rzp1.open();

      } else {
        this.attendanceStatus = 'Error initiating payment order';
        this.isProcessingPayment = false;
      }
    } catch (error) {
      this.handleError(error);
      this.isProcessingPayment = false;
    }
  }

  private verifyPayment(paymentResponse: any, attendanceData: any) {
      this.apiService.verifyRazorpayPayment(paymentResponse).subscribe({
          next: (res) => {
              if (res.success) {
                  this.attendanceStatus = this.translations().ATTENDANCE_MARKED_SUCCESS;
                  
                  // Mark attendance in system
                    this.apiService.markAttendanceWithPayment({
                      ...attendanceData,
                      attendanceFee: this.attendanceFee,
                      feePaid: true,
                      paymentTransactionId: res.transaction_id,
                      latitude: this.currentLocation.latitude,
                      longitude: this.currentLocation.longitude,
                      face_verified: true,
                      groupId: attendanceData.groupId
                    }).subscribe({
                      next: () => {
                        console.log('Attendance recorded with payment');
                        this.isProcessingPayment = false;
                        this.attendanceStatus = 'Success: Attendance marked successfully!'; // Ensure 'Success' prefix for styling
                        this.selectedMeetingId = null; // Reset selection
                        this.currentLocation = null; // Reset location
                      },
                      error: (error) => {
                        console.error('Error recording attendance:', error);
                        // Show specific error from backend if available
                        const backendMsg = error.error?.message || error.message || 'Unknown error';
                        this.attendanceStatus = `Error: ${backendMsg}`;
                        this.isProcessingPayment = false;
                      }
                    });

              } else {
                  this.attendanceStatus = 'Payment verification failed.';
                  this.isProcessingPayment = false;
              }
          },
          error: (err) => {
              this.attendanceStatus = 'Error verifying payment on server.';
              this.isProcessingPayment = false;
          }
      });
  }

  private getCurrentLocation(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  private handleError(error: any) {
    if (typeof error === 'object' && error !== null && 'error' in error) {
         this.attendanceStatus = (error as any).error.message || 'Error occurred';
    } else {
         this.attendanceStatus = `${this.translations().ERROR}: ${error.message || error}`;
    }
    this.stopScanning();
    this.isProcessingPayment = false;
  }
}


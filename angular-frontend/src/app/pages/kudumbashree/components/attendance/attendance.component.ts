import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { PaymentService } from '../../services/payment.service';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  private paymentService = inject(PaymentService);
  private dialog = inject(MatDialog);

  translations = this.translationService.translations$;
  
  currentLocation: any = null;
  isScanning = false;
  isProcessingPayment = false;
  attendanceStatus = '';
  attendanceFee = this.paymentService.getAttendanceFee();

  async markAttendance() {
    try {
      this.isScanning = true;
      this.attendanceStatus = '';
      
      // Step 1: Get location
      this.currentLocation = await this.getCurrentLocation();
      
      // Step 2: Scan face
      const faceVerified = await this.scanFace();
      
      if (faceVerified && this.currentLocation) {
        // Step 3: Attendance verified, now process payment
        await this.processPayment();
      }
    } catch (error) {
      this.attendanceStatus = `${this.translations().ERROR}: ${error}`;
      this.isScanning = false;
      this.isProcessingPayment = false;
    }
  }

  private async processPayment() {
    this.isScanning = false;
    this.isProcessingPayment = true;
    
    const attendanceData = {
      location: this.currentLocation,
      timestamp: new Date(),
      faceVerified: true,
      meetingTitle: 'Monthly Community Meeting', // This would come from selected meeting
      meetingId: 'meeting_001',
      userId: 'user_001',
      userName: 'Community Member'
    };

    try {
      // Generate payment QR code
      const paymentResult = await this.paymentService.recordAttendancePayment(attendanceData);
      
      if (paymentResult.success && paymentResult.qrCode && paymentResult.transactionId) {
        // Show payment dialog
        const dialogRef = this.dialog.open(PaymentDialogComponent, {
          width: '500px',
          data: {
            qrCode: paymentResult.qrCode,
            amount: this.attendanceFee,
            transactionId: paymentResult.transactionId,
            description: `Attendance Fee - ${attendanceData.meetingTitle}`
          }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
          if (result?.paid) {
            this.attendanceStatus = this.translations().ATTENDANCE_MARKED_SUCCESS;
            
            // Mark attendance in system
            this.apiService.markAttendanceWithPayment({
              ...attendanceData,
              attendanceFee: this.attendanceFee,
              feePaid: true,
              paymentTransactionId: paymentResult.transactionId
            }).subscribe({
              next: () => {
                console.log('Attendance recorded with payment');
              },
              error: (error) => {
                console.error('Error recording attendance:', error);
              }
            });
          } else {
            this.attendanceStatus = 'Payment not completed. Attendance not recorded.';
          }
          this.isProcessingPayment = false;
        });
      } else {
        this.attendanceStatus = 'Error generating payment QR code';
        this.isProcessingPayment = false;
      }
    } catch (error) {
      this.attendanceStatus = `Payment error: ${error}`;
      this.isProcessingPayment = false;
    }
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
        (error) => reject(error)
      );
    });
  }

  private scanFace(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 2000);
    });
  }
}
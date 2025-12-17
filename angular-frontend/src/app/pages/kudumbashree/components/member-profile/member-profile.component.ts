import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService, User } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

interface ProfileStats {
  totalMeetings: number;
  meetingsAttended: number;
  attendanceRate: number;
  totalLoans: number;
  activeLoans: number;
  totalPaid: number;
  pendingPayments: number;
}

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule
  ],
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.scss'
})
export class MemberProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private snackBar = inject(MatSnackBar);

  translations = this.translationService.translations$;
  user = this.authService.user;

  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;

  profileStats: ProfileStats = {
    totalMeetings: 24,
    meetingsAttended: 18,
    attendanceRate: 75,
    totalLoans: 3,
    activeLoans: 1,
    totalPaid: 12500,
    pendingPayments: 1500
  };

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      communityUnit: ['', Validators.required],
      address: [''],
      emergencyContact: [''],
      occupation: ['']
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        communityUnit: currentUser.communityUnit || '',
        address: '123 Community Street, City, State - 123456',
        emergencyContact: '9876543210',
        occupation: 'Homemaker'
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserProfile(); // Reset form if canceling edit
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      
      // Note: In production, this would update via the main backend API
      // For now, just show success message
      setTimeout(() => {
        this.isEditing = false;
        this.isLoading = false;
        
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1000);
    }
  }

  getFormattedAmount(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  getAttendancePercentage(): number {
    return Math.round((this.profileStats.meetingsAttended / this.profileStats.totalMeetings) * 100);
  }
}
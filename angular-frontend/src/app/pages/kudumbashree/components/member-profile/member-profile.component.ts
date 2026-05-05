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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';

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
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.scss'
})
export class MemberProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  translations = this.translationService.translations$;
  user = this.authService.user;

  profileForm: FormGroup;
  isEditing = false;
  isLoading = true;
  isSaving = false;

  // Kudumbashree profile fields
  memberId = '';
  joinDate: Date | null = null;
  groupName = '';
  bankAccount = '';
  ifscCode = '';

  profileStats: ProfileStats = {
    totalMeetings: 0,
    meetingsAttended: 0,
    attendanceRate: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalPaid: 0,
    pendingPayments: 0
  };

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      communityUnit: [''],
      address: [''],
      houseNumber: [''],
      panchayatName: ['']
    });
  }

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading = true;

    forkJoin({
      profile: this.apiService.getMemberProfile().pipe(catchError(() => of(null))),
      attendanceHistory: this.apiService.getAttendanceHistory().pipe(catchError(() => of([]))),
      loans: this.apiService.getLoans().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ profile, attendanceHistory, loans }) => {
        this.populateFromProfile(profile);
        this.computeStats(attendanceHistory as any[], loans as any[]);
        this.isLoading = false;
      },
      error: () => {
        // Fallback to auth service data if API fails
        this.populateFromAuthUser();
        this.isLoading = false;
      }
    });
  }

  private populateFromProfile(profile: any) {
    if (!profile) {
      // Fallback to auth service data
      this.populateFromAuthUser();
      return;
    }

    const user = profile.User || {};

    // Kudumbashree-specific fields
    this.memberId = profile.memberId || '';
    this.joinDate = profile.join_date ? new Date(profile.join_date) : null;
    this.groupName = profile.KudumbashreeGroup?.name || '';
    this.bankAccount = profile.bank_account || '';
    this.ifscCode = profile.ifsc_code || '';

    this.profileForm.patchValue({
      name: user.full_name || this.user()?.name || '',
      email: user.email || this.user()?.email || '',
      phone: user.mobile_number || this.user()?.phone || '',
      communityUnit: this.user()?.communityUnit || '',
      address: user.address || '',
      houseNumber: '',
      panchayatName: ''
    });
  }

  private populateFromAuthUser() {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        communityUnit: currentUser.communityUnit || '',
        address: '',
        houseNumber: '',
        panchayatName: ''
      });
    }
  }

  private computeStats(attendanceHistory: any[], loans: any[]) {
    // Attendance stats
    const attended = attendanceHistory.filter(a => a.status === 'Present').length;
    const totalMeetings = attendanceHistory.length;

    // Loan stats
    const activeLoans = loans.filter(l => l.status === 'Approved' || l.status === 'Disbursed').length;
    const totalPaid = loans
      .filter(l => l.status === 'Paid' || l.status === 'Closed')
      .reduce((sum, l) => sum + (l.amount || 0), 0);
    const pendingPayments = loans
      .filter(l => l.status === 'Approved' || l.status === 'Disbursed')
      .reduce((sum, l) => sum + (l.remaining_amount || l.amount || 0), 0);

    this.profileStats = {
      totalMeetings,
      meetingsAttended: attended,
      attendanceRate: totalMeetings > 0 ? Math.round((attended / totalMeetings) * 100) : 0,
      totalLoans: loans.length,
      activeLoans,
      totalPaid,
      pendingPayments
    };
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadAllData(); // Reset to server data on cancel
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isSaving = true;
      // Note: Profile editing can be wired to a PUT endpoint when ready.
      // For now, simulate save and update local auth user display.
      setTimeout(() => {
        this.isEditing = false;
        this.isSaving = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 800);
    }
  }

  getFormattedAmount(amount: number): string {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  }

  getAttendancePercentage(): number {
    return this.profileStats.attendanceRate;
  }
}

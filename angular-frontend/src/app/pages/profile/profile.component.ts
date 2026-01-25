import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile.component.html',
  styles: [`
    .profile-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .completion-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .form-card {
      border-radius: 20px;
    }
    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 600px) {
      .grid-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  completionPercentage = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.email]],
      mobile_number: [{ value: '', disabled: true }],
      house_number: ['', Validators.required],
      ward_number: [''],
      panchayat_name: [''],
      address: [''],
      aadhaar_number: ['', [Validators.pattern(/^\d{12}$/)]],
      profile_image: ['']
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({
          profile_image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profileForm.patchValue(data);
        this.completionPercentage = data.completion || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.userService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (res) => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.completionPercentage = res.user.completion;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { PickupService } from '../../../core/services/pickup.service';

@Component({
  selector: 'app-schedule-pickup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './schedule-pickup.component.html',
  styleUrls: ['./schedule-pickup.component.css']
})
export class SchedulePickupComponent {
  pickupForm: FormGroup;
  loading = false;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private pickupService: PickupService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.pickupForm = this.fb.group({
      scheduledDate: [null, Validators.required],
      scheduledTime: ['', Validators.required],
      address: ['', Validators.required]
    });

    // Pre-fill address if available
    const user = this.authService.currentUserValue;
    if (user?.address) {
      this.pickupForm.patchValue({ address: user.address });
    }
  }

  onSubmit(): void {
    if (this.pickupForm.invalid) {
      return;
    }

    const user = this.authService.currentUserValue;
    if (!user) {
      return;
    }

    this.loading = true;
    this.pickupService.schedulePickup(user.id, user.name, this.pickupForm.value).subscribe({
      next: () => {
        this.snackBar.open('Pickup scheduled successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/user/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error.message || 'Failed to schedule pickup', 'Close', { duration: 3000 });
      }
    });
  }
}

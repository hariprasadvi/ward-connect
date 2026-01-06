import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { PickupService } from '../../../core/services/pickup.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-schedule-pickup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './admin-schedule-pickup.component.html',
  styleUrls: ['./admin-schedule-pickup.component.css']
})
export class AdminSchedulePickupComponent implements OnInit {
  scheduleForm: FormGroup;
  houseNumbers$: Observable<string[]>;
  today = new Date();
  availableTimes: string[] = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  constructor(
    private fb: FormBuilder,
    private pickupService: PickupService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.scheduleForm = this.fb.group({
      houseNumbers: [[], [Validators.required]],
      scheduledDate: [null, [Validators.required]],
      scheduledTime: ['', [Validators.required]],
      vehicleNumber: ['', [Validators.required]]
    });
    this.houseNumbers$ = this.pickupService.getAvailableHouseNumbers();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.scheduleForm.valid) {
      this.pickupService.scheduleAdminPickup(this.scheduleForm.value).subscribe({
        next: () => {
          this.snackBar.open('Pickups scheduled successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          this.snackBar.open('Error scheduling pickups', 'Close', {
            duration: 3000
          });
          console.error(err);
        }
      });
    }
  }
}

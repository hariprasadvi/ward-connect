import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-job-application-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule
    ],
    template: `
    <h2 mat-dialog-title>Apply for {{ data.jobTitle }}</h2>
    <mat-dialog-content>
      <form [formGroup]="applicationForm" class="flex flex-col gap-4 mt-2">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Your Name</mat-label>
          <input matInput formControlName="name" placeholder="John Doe">
          <mat-error *ngIf="applicationForm.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email Address</mat-label>
          <input matInput formControlName="email" placeholder="you@example.com">
          <mat-error *ngIf="applicationForm.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="applicationForm.get('email')?.hasError('email')">Invalid email address</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="applicationForm.invalid" (click)="onSubmit()">Submit Application</button>
    </mat-dialog-actions>
  `,
    styles: [`
    mat-form-field { width: 100%; }
  `]
})
export class JobApplicationDialogComponent {
    applicationForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<JobApplicationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { jobTitle: string, company: string }
    ) {
        // Pre-fill from logged-in user data
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        this.applicationForm = this.fb.group({
            name: [user.full_name || '', Validators.required],
            email: [user.email || '', [Validators.required, Validators.email]]
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        if (this.applicationForm.valid) {
            this.dialogRef.close(this.applicationForm.value);
        }
    }
}

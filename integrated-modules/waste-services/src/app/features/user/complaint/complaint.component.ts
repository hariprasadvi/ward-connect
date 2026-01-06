import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { ComplaintService } from '../../../core/services/complaint.service';
import { ComplaintCategory } from '../../../core/models/complaint.model';

@Component({
  selector: 'app-complaint',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.css']
})
export class ComplaintComponent {
  complaintForm: FormGroup;
  loading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  categories = [
    { value: ComplaintCategory.MISSED_PICKUP, label: 'Missed Pickup' },
    { value: ComplaintCategory.IMPROPER_COLLECTION, label: 'Improper Collection' },
    { value: ComplaintCategory.LITTERING, label: 'Littering' },
    { value: ComplaintCategory.ILLEGAL_DUMPING, label: 'Illegal Dumping' },
    { value: ComplaintCategory.OTHER, label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private complaintService: ComplaintService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.complaintForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onSubmit(): void {
    if (this.complaintForm.invalid) {
      return;
    }

    const user = this.authService.currentUserValue;
    if (!user) {
      return;
    }

    const formData = {
      ...this.complaintForm.value,
      photo: this.selectedFile
    };

    this.loading = true;
    this.complaintService.submitComplaint(user.id, user.name, formData).subscribe({
      next: () => {
        this.snackBar.open('Complaint submitted successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/user/my-complaints']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error.message || 'Failed to submit complaint', 'Close', { duration: 3000 });
      }
    });
  }
}

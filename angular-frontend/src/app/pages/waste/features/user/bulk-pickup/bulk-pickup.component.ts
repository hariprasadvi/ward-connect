import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { PickupService } from '../../../core/services/pickup.service';
import { AiService } from '../../../core/services/ai.service';

@Component({
  selector: 'app-bulk-pickup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './bulk-pickup.component.html',
  styleUrls: ['./bulk-pickup.component.css']
})
export class BulkPickupComponent {
  pickupForm: FormGroup;
  minDate = new Date();
  
  wasteTypes = [
    'Furniture',
    'Electronics',
    'Construction Debris',
    'Garden Waste',
    'Other'
  ];

  availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private pickupService: PickupService,
    private router: Router,
    private snackBar: MatSnackBar,
    private aiService: AiService
  ) {
    const user: any = this.authService.currentUserValue;
    
    this.pickupForm = this.fb.group({
      wasteType: ['', Validators.required],
      quantity: ['', Validators.required],
      description: ['', Validators.required],
      scheduledDate: ['', Validators.required],
      scheduledTime: ['', Validators.required],
      address: [user?.address || '', Validators.required]
    });
  }

  isAnalyzing = false;

  autoClassify(): void {
    const description = this.pickupForm.get('description')?.value;
    if (!description) return;

    this.isAnalyzing = true;
    this.aiService.classifyWaste(description).subscribe({
      next: (result) => {
        this.isAnalyzing = false;
        
        // Try to match category to existing types
        // wasteTypes: ['Furniture', 'Electronics', 'Construction Debris', 'Garden Waste', 'Other']
        // AI returns: Recyclable, Organic, Hazardous using simple heuristic currently
        // I need to map or just suggest.
        
        // Let's assume AI might accept our types as prompt in future, but for now map loosely
        let matchedType = 'Other';
        if (result.category === 'Recyclable') matchedType = 'Electronics'; // Just a guess for demo
        else if (result.category === 'Organic') matchedType = 'Garden Waste';
        
        // Better: Show the tips
        this.snackBar.open(`AI Suggestion: ${result.category}. ${result.tips}`, 'Apply', { duration: 5000 })
          .onAction().subscribe(() => {
             // If user clicks Apply, maybe set type if possible, or just acknowledge
          });
          
        // Actually, let's just show the analysis
        this.snackBar.open(result.analysis, 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.isAnalyzing = false;
        this.snackBar.open('AI Analysis failed', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.pickupForm.valid) {
      const user: any = this.authService.currentUserValue;
      if (!user) return;

      this.pickupService.scheduleBulkPickup(
        user.id,
        (user.full_name || user.name),
        this.pickupForm.value
      ).subscribe({
        next: () => {
          this.snackBar.open('Bulk pickup request submitted successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/waste/user/dashboard']);
        },
        error: (error) => {
          this.snackBar.open('Error submitting request', 'Close', {
            duration: 3000
          });
          console.error(error);
        }
      });
    }
  }
}





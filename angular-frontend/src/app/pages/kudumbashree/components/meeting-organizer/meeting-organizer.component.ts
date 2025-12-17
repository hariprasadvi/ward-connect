import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-meeting-organizer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './meeting-organizer.component.html',
  styleUrl: './meeting-organizer.component.scss'
})
export class MeetingOrganizerComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);

  translations = this.translationService.translations$;

  meetingForm: FormGroup;

  constructor() {
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      description: ['']
    });
  }

  scheduleMeeting() {
    if (this.meetingForm.valid) {
      this.apiService.scheduleMeeting(this.meetingForm.value).subscribe({
        next: () => {
          alert('Meeting scheduled successfully!');
          this.meetingForm.reset();
        },
        error: (error) => console.error('Error scheduling meeting:', error)
      });
    }
  }
}
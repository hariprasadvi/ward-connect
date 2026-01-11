import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

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
    MatNativeDateModule,
    MatIconModule
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
      latitude: [null],
      longitude: [null],
      radius: [100],
      description: ['']
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.meetingForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get current location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
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

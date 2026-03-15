import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';

@Component({
    selector: 'app-application-history',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">My Applications</h2>
          <p class="text-gray-500 text-sm mt-1">Track all jobs you've applied to</p>
        </div>
        <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
          {{ applications.length }} Applied
        </span>
      </div>

      <!-- Email Search -->
      <div class="glass-card p-4 flex gap-3 items-center">
        <input
          type="email"
          [(ngModel)]="emailQuery"
          placeholder="Enter the email you used to apply..."
          class="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
        />
        <button (click)="loadApplications()" class="btn-primary !w-auto !py-2 !px-5 text-sm">
          🔍 Search
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let i of [1,2,3]" class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && searched && applications.length === 0"
           class="text-center py-16 text-gray-400">
        <div class="text-5xl mb-4">📭</div>
        <p class="text-lg font-medium">No applications found</p>
        <p class="text-sm mt-1">No jobs were applied to with this email address.</p>
      </div>

      <!-- Application Cards -->
      <div class="space-y-4" *ngIf="!loading && applications.length > 0">
        <div *ngFor="let app of applications"
             class="glass-card p-5 flex justify-between items-start hover:border-indigo-200 transition-all">
          <div class="flex gap-4 items-start">
            <!-- Company Initial Avatar -->
            <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {{ app.company?.charAt(0) || '?' }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-base">{{ app.jobTitle }}</h3>
              <p class="text-gray-500 text-sm">{{ app.company }}</p>
              <p class="text-xs text-gray-400 mt-1">Applied as: <span class="text-gray-600">{{ app.applicantName }}</span></p>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <span class="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium mb-1">
              ✅ Applied
            </span>
            <p class="text-xs text-gray-400">{{ app.appliedAt | date: 'd MMM y, h:mm a' }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApplicationHistoryComponent implements OnInit {
    applications: any[] = [];
    loading = false;
    searched = false;
    emailQuery = '';

    constructor(private jobService: JobService) { }

    ngOnInit() {
        // Pre-fill email from localStorage if available
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.email) {
            this.emailQuery = user.email;
            this.loadApplications();
        }
    }

    loadApplications() {
        if (!this.emailQuery) return;
        this.loading = true;
        this.searched = true;
        this.jobService.getMyApplications(this.emailQuery).subscribe({
            next: (data) => {
                this.applications = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }
}

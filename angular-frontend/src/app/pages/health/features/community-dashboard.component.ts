import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-community-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="p-8 max-w-6xl mx-auto">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">Community Health Dashboard</h1>
          <p class="text-gray-500">Real-time overview of community health trends.</p>
        </div>
        <div class="flex items-center gap-4">
             <button *ngIf="isHealthWorker" (click)="showUpdateForm = !showUpdateForm"
                    class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-indigo-700 transition">
                <mat-icon class="align-middle mr-1 text-sm">edit</mat-icon> Update Data
            </button>
            <div class="bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live Updates On
            </div>
        </div>
      </div>

      <!-- Health Worker Update Form -->
      <div *ngIf="isHealthWorker && showUpdateForm" class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 animate-fade-in">
        <h3 class="font-bold text-lg mb-4 text-indigo-900">Update Health Stats</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-indigo-700 mb-1">Active Cases</label>
                <input type="number" [(ngModel)]="stats.activeCases" class="w-full p-2 rounded-lg border-indigo-200">
            </div>
            <div>
                <label class="block text-sm font-medium text-indigo-700 mb-1">Critical Alerts</label>
                <input type="number" [(ngModel)]="stats.alerts" class="w-full p-2 rounded-lg border-indigo-200">
            </div>
            <div>
                <label class="block text-sm font-medium text-indigo-700 mb-1">Immunity %</label>
                <input type="number" [(ngModel)]="stats.immunity" class="w-full p-2 rounded-lg border-indigo-200">
            </div>
             <div class="md:col-span-3">
                <label class="block text-sm font-medium text-indigo-700 mb-1">Alert Message</label>
                <input type="text" [(ngModel)]="stats.alertMessage" class="w-full p-2 rounded-lg border-indigo-200">
            </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Active Cases -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div class="flex justify-between items-center text-gray-500 font-medium">
            <span>Total Active Cases</span>
            <mat-icon class="text-sky-500">groups</mat-icon>
          </div>
          <div class="text-4xl font-extrabold text-gray-900">{{stats.activeCases}}</div>
          <div class="flex items-center gap-2 text-sm font-semibold text-indigo-500">
            <mat-icon class="text-base w-4 h-4 flex items-center">trending_down</mat-icon> 
            12% decrease
            <span class="text-gray-400 font-normal">from last week</span>
          </div>
        </div>

        <!-- Health Alerts -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div class="flex justify-between items-center text-gray-500 font-medium">
            <span>Critical Health Alerts</span>
            <mat-icon class="text-rose-500">warning</mat-icon>
          </div>
          <div class="text-4xl font-extrabold text-gray-900">{{stats.alerts}}</div>
          <div class="text-sm text-gray-500">
            {{stats.alertMessage}}
          </div>
        </div>

        <!-- Immunity Coverage -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div class="flex justify-between items-center text-gray-500 font-medium">
            <span>Immunity Coverage</span>
            <mat-icon class="text-indigo-500">health_and_safety</mat-icon>
          </div>
          <div class="text-4xl font-extrabold text-gray-900">{{stats.immunity}}%</div>
          <div class="w-full bg-gray-100 h-2 rounded-full mt-auto overflow-hidden">
            <div class="bg-indigo-500 h-full rounded-full" [style.width.%]="stats.immunity"></div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
        <h3 class="text-xl font-bold mb-8">Weekly Infection vs Recovery Trends</h3>
        
        <!-- SVG Chart -->
        <div class="flex-1 w-full relative">
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" class="w-full h-full overflow-visible">
                <!-- Grid Lines -->
                <g class="text-gray-200">
                    <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" stroke-width="0.1" />
                    <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="currentColor" stroke-width="0.1" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" stroke-width="0.1" />
                    <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="currentColor" stroke-width="0.1" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" stroke-width="0.1" />
                </g>

                <!-- Area Gradients -->
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:rgb(14, 165, 233);stop-opacity:0.2" />
                        <stop offset="100%" style="stop-color:rgb(14, 165, 233);stop-opacity:0" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:rgb(99, 102, 241);stop-opacity:0.2" />
                        <stop offset="100%" style="stop-color:rgb(99, 102, 241);stop-opacity:0" />
                    </linearGradient>
                </defs>

                <!-- Path 1: Active Cases (Indigo) -->
                <path [attr.d]="getPath(activeData)" fill="url(#grad2)" stroke="#6366f1" stroke-width="0.5" vector-effect="non-scaling-stroke" />

                <!-- Path 2: Total Cases (Sky) -->
                <path [attr.d]="getPath(casesData)" fill="url(#grad1)" stroke="#0ea5e9" stroke-width="0.5" vector-effect="non-scaling-stroke" />
                
            </svg>
            
            <!-- X Axis Labels -->
            <div class="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                <span *ngFor="let d of data">{{d.name}}</span>
            </div>
        </div>
      </div>
    </div>
  `
})
export class CommunityDashboardComponent {
  authService = inject(AuthService);

  showUpdateForm = false;

  stats = {
    activeCases: 452,
    alerts: 3,
    immunity: 87,
    alertMessage: 'Flu outbreak reported in Sector 4'
  };

  data = [
    { name: 'Mon', cases: 4000, active: 2400 },
    { name: 'Tue', cases: 3000, active: 2200 },
    { name: 'Wed', cases: 5000, active: 3800 },
    { name: 'Thu', cases: 2780, active: 2000 },
    { name: 'Fri', cases: 4890, active: 3100 },
    { name: 'Sat', cases: 3390, active: 2500 },
    { name: 'Sun', cases: 5490, active: 3800 },
  ];

  get isHealthWorker(): boolean {
    // Return true for testing if needed, but primarily use auth service
    return this.authService.hasRole('Health Worker');
  }

  // Map data to SVG coordinates (0-100 x, 0-50 y)
  // Max value approx 6000
  get casesData() {
    return this.data.map(d => d.cases);
  }

  get activeData() {
    return this.data.map(d => d.active);
  }

  getPath(values: number[]): string {
    const maxY = 6000;
    const width = 100;
    const height = 50;

    // Generate points
    let path = `M 0,${height} `; // Start at bottom left

    values.forEach((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (val / maxY) * height;
      path += `L ${x},${y} `;
    });

    path += `L ${width},${height} Z`; // Close path to bottom right and back to start
    return path;
  }
}

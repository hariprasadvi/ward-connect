import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-job-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterOutlet],
    templateUrl: './job-dashboard.component.html',
    styles: [`
    .nav-btn {
      @apply flex items-center gap-3 px-6 py-4 rounded-xl text-left transition-all duration-300 border border-transparent;
    }
    .nav-btn.active {
      @apply bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm font-semibold;
    }
    .nav-btn:not(.active):hover {
      @apply bg-gray-50 text-gray-900;
    }
  `]
})
export class JobDashboardComponent {
    tabs = [
        { name: 'Job Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', link: 'alerts' },
        { name: 'AI Career Chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', link: 'chat' },
        { name: 'CV Generator', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', link: 'cv' },
    ];
}

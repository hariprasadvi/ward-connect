import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-dashboard',
  templateUrl: './job-dashboard.component.html',
  styleUrls: ['./job-dashboard.component.css']
})
export class JobDashboardComponent {
  features = [
    { id: 'chatbot', title: 'CHATBOT_TITLE', icon: '🤖', link: 'chatbot' },
    { id: 'cv', title: 'CV_TITLE', icon: '📄', link: 'cv-generator' },
    { id: 'apply', title: 'APPLY_TITLE', icon: '📢', link: 'apply' }
  ];
  email = '';

  constructor(private router: Router, private jobService: JobService) { }

  navigate(link: string) {
    this.router.navigate(['/job', link]);
  }

  subscribe() {
    if (!this.email) {
      alert('Please enter your email');
      return;
    }
    this.jobService.subscribeToAlerts(this.email).subscribe({
      next: (res) => {
        alert('Subscribed successfully!');
        this.email = '';
      },
      error: (err) => {
        console.error(err);
        alert('Subscription failed. Try again.');
      }
    });
  }
}

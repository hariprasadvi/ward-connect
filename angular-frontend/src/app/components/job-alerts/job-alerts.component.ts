import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';

@Component({
    selector: 'app-job-alerts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './job-alerts.component.html'
})
export class JobAlertsComponent implements OnInit {
    jobs: any[] = [];
    loading = true;

    constructor(private jobService: JobService) { }

    ngOnInit() {
        this.jobService.getJobAlerts().subscribe({
            next: (data) => {
                this.jobs = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    apply(job: any) {
        const name = prompt("Enter your Name for application:");
        if (!name) return;
        const email = prompt("Enter your Email:");
        if (!email) return;

        const application = {
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            applicantName: name,
            applicantEmail: email
        };

        this.jobService.applyJob(application).subscribe({
            next: (res) => {
                alert(`✅ Application Submitted for ${job.title} at ${job.company}!`);
            },
            error: (err) => {
                console.error(err);
                alert("❌ Failed to submit application. Please try again.");
            }
        });
    }
}

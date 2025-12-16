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
}

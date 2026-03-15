import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JobApplicationDialogComponent } from '../../components/job-application-dialog/job-application-dialog.component';

@Component({
    selector: 'app-job-alerts',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    templateUrl: './job-alerts.component.html'
})
export class JobAlertsComponent implements OnInit {
    jobs: any[] = [];
    loading = true;
    successMessage = '';

    constructor(
        private jobService: JobService,
        private dialog: MatDialog
    ) { }

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
        const dialogRef = this.dialog.open(JobApplicationDialogComponent, {
            width: '420px',
            data: { jobTitle: job.title, company: job.company }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const application = {
                    jobId: job.id,
                    jobTitle: job.title,
                    company: job.company,
                    applicantName: result.name,
                    applicantEmail: result.email
                };

                this.jobService.applyJob(application).subscribe({
                    next: () => {
                        this.successMessage = `Application submitted for ${job.title} at ${job.company}!`;
                        setTimeout(() => this.successMessage = '', 4000);
                    },
                    error: (err) => {
                        console.error(err);
                        this.successMessage = '❌ Failed to submit application. Please try again.';
                        setTimeout(() => this.successMessage = '', 4000);
                    }
                });
            }
        });
    }
}

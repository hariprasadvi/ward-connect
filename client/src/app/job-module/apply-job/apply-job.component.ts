import { Component, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.css']
})
export class ApplyJobComponent implements OnInit {
  jobs: any[] = [];
  selectedJob: any = null;
  applicantData = {
    name: '',
    email: '',
    phone: ''
  };

  constructor(private jobService: JobService) { }

  ngOnInit() {
    this.jobService.getJobs().subscribe({
      next: (jobs) => this.jobs = jobs,
      error: (err) => console.error(err)
    });
  }

  openApplyForm(job: any) {
    this.selectedJob = job;
  }

  closeApplyForm() {
    this.selectedJob = null;
    this.applicantData = { name: '', email: '', phone: '' };
  }

  submitApplication() {
    if (!this.applicantData.name || !this.applicantData.email) {
      alert('Please fill in required fields');
      return;
    }

    const payload = {
      jobTitle: this.selectedJob.title,
      company: this.selectedJob.company,
      ...this.applicantData
    };

    this.jobService.applyJob(payload).subscribe({
      next: (res) => {
        alert('Application Sent Successfully!');
        this.closeApplyForm();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to send application.');
      }
    });
  }
}

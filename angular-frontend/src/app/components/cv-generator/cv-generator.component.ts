import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';

@Component({
    selector: 'app-cv-generator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cv-generator.component.html'
})
export class CvGeneratorComponent {
    userData = {
        name: '',
        email: '',
        phone: '',
        experience: '',
        skills: '',
        education: ''
    };
    generatedCV = '';
    loading = false;

    constructor(private jobService: JobService) { }

    generateCV() {
        this.loading = true;
        this.jobService.generateCV(this.userData).subscribe({
            next: (res) => {
                this.generatedCV = res.cv;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }
}

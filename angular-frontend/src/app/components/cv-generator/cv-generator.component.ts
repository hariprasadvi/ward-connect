import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
    selector: 'app-cv-generator',
    standalone: true,
    imports: [CommonModule, FormsModule, MarkdownPipe],
    templateUrl: './cv-generator.component.html'
})
export class CvGeneratorComponent {
    userData = {
        name: '',
        location: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        jobTitle: '',
        education: '',
        experience: '',
        projects: '',
        skills: '',
        certifications: '',
        languages: ''
    };
    generatedCV: any = null;
    loading = false;
    errorMsg = '';
    successMsg = '';

    constructor(private jobService: JobService) { }

    generateCV() {
        this.errorMsg = '';
        this.successMsg = '';

        if (!this.userData.name.trim() || !this.userData.jobTitle.trim()) {
            this.errorMsg = '⚠️ Please fill in your Name and Target Job Title.';
            return;
        }
        this.loading = true;
        this.jobService.generateCV(this.userData).subscribe({
            next: (res) => {
                this.generatedCV = res.cv;
                this.loading = false;
                this.successMsg = '✅ CV Generated Successfully! Scroll down to preview.';
            },
            error: (err) => {
                console.error(err);
                this.errorMsg = '❌ Generation Failed: ' + (err.error?.message || err.message || 'Server Error');
                this.loading = false;
            }
        });
    }

    downloadPDF() {
        const data = document.getElementById('cv-preview');
        if (!data) return;

        this.loading = true;

        // Higher scale for better quality
        html2canvas(data, { scale: 3, useCORS: true } as any).then(canvas => {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = 297;
            const margin = 0; // Remove PDF margin to use full A4 width (CSS has padding)

            // Calculate dimensions to fit within the page minus margins
            const contentWidth = pdfWidth - (margin * 2);
            const contentHeight = pdfHeight - (margin * 2);

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Calculate scale ratio to fit the content completely within the single page bounds
            const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);

            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;

            // Align content to top-left (no margin offset needed)
            const x = 0;
            const y = 0;

            const contentDataURL = canvas.toDataURL('image/png');

            pdf.addImage(contentDataURL, 'PNG', x, y, finalWidth, finalHeight);

            pdf.save(`${this.userData.name.replace(/\s+/g, '_')}_CV.pdf`);
            this.loading = false;
        }).catch(err => {
            console.error('PDF Generation Error:', err);
            this.errorMsg = 'Failed to generate PDF. Please try again.';
            this.loading = false;
        });
    }
}

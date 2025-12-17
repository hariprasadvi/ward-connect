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
        skills: '',
        certifications: '',
        languages: ''
    };
    generatedCV: any = null;
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

    downloadPDF() {
        const printContent = document.getElementById('cv-preview');
        if (!printContent) return;

        // Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(`
                <html>
                <head>
                    <title>${this.userData.name}_CV</title>
                    <style>
                        @media print {
                            @page { margin: 10mm; }
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                        body {
                            font-family: 'Times New Roman', Times, serif;
                            color: #000;
                            line-height: 1.5;
                            margin: 0;
                            padding: 20px;
                        }
                        /* Mimic the Preview Styles Explicitly */
                        h1 { font-size: 24pt; font-weight: bold; text-align: center; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em; }
                        .text-center { text-align: center; }
                        .contact-info { display: flex; justify-content: center; gap: 15px; font-size: 10pt; margin-bottom: 5px; flex-wrap: wrap; }
                        .links { display: flex; justify-content: center; gap: 15px; font-size: 10pt; color: #1e3a8a; font-weight: 500; }
                        a { text-decoration: none; color: inherit; }
                        
                        hr { border: 0; border-top: 1px solid #000; margin: 15px 0; }
                        
                        h2 { 
                            font-size: 12pt; 
                            font-weight: bold; 
                            text-transform: uppercase; 
                            border-bottom: 1px solid #ccc; 
                            padding-bottom: 3px; 
                            margin-top: 20px; 
                            margin-bottom: 10px; 
                            letter-spacing: 0.05em;
                        }
                        
                        p, li, div { font-size: 11pt; }
                        .section-item { margin-bottom: 12px; }
                        .flex-between { display: flex; justify-content: space-between; align-items: baseline; }
                        .font-bold { font-weight: bold; }
                        .italic { font-style: italic; }
                        .text-sm { font-size: 10pt; }
                        .mb-1 { margin-bottom: 4px; }
                        
                        ul { padding-left: 20px; margin-top: 5px; margin-bottom: 5px; }
                        li { margin-bottom: 2px; }
                        
                        .grid-2 { display: grid; grid-template-columns: 1fr; gap: 10px; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
                </html>
            `);
            doc.close();

            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                document.body.removeChild(iframe);
            }, 500);
        }
    }
}

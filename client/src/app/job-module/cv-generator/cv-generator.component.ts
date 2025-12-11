import { Component } from '@angular/core';
import { JobService } from '../../services/job.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-cv-generator',
  templateUrl: './cv-generator.component.html',
  styleUrls: ['./cv-generator.component.css']
})
export class CvGeneratorComponent {
  step = 1;
  formData = {
    personalInfo: { name: '', email: '', phone: '' },
    education: '',
    experience: '',
    skills: ''
  };
  generatedCV = '';
  isGenerating = false;

  constructor(private jobService: JobService) { }

  generate() {
    this.isGenerating = true;
    const data = {
      ...this.formData,
      education: this.formData.education,
      experience: this.formData.experience,
      skills: this.formData.skills.split(',').map(s => s.trim())
    };

    this.jobService.generateCV(data).subscribe({
      next: (res) => {
        this.generatedCV = res.cvContent;
        this.isGenerating = false;
        this.step = 2;
      },
      error: (err) => {
        console.error(err);
        alert('Error generating CV. Please try again.');
        this.isGenerating = false;
      }
    });
  }

  download() {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(this.generatedCV, 180);
    doc.text(splitText, 15, 15);
    doc.save('Professional_CV.pdf');
  }

  reset() {
    this.step = 1;
    this.generatedCV = '';
  }
}

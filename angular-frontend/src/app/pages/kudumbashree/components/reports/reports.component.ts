import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../services/dashboard.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reports.component.html',
  styles: [`
    .reports-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Outfit', sans-serif;
    }
    .header-section {
      margin-bottom: 32px;
      text-align: center;
    }
    .header-section h1 {
        font-size: 2.5rem;
        background: linear-gradient(135deg, #FF6B6B 0%, #d93d3d 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 8px;
    }
    .header-section p {
        color: #666;
        font-size: 1.1rem;
    }
    .control-panel {
      margin-bottom: 32px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .panel-content {
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 24px;
        justify-content: center;
        background: #fff;
    }
    .actions {
        display: flex;
        gap: 16px;
        align-items: center;
        width: 100%;
        justify-content: center;
    }
    .report-result {
        border-radius: 16px;
        border: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        overflow: hidden;
    }
    .result-header {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        padding: 20px 24px;
    }
    .result-header h2 {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .report-preview {
      padding: 30px;
      background: #fdfdfd;
      white-space: pre-wrap;
      font-family: 'Roboto', sans-serif;
      line-height: 1.8;
      color: #333;
      font-size: 1.05rem;
    }
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 40px 0;
        gap: 15px;
        color: #666;
    }
  `]
})
export class ReportsComponent {
  dashboardService = inject(DashboardService);

  reportType: string = 'Loan';
  reportContent: string = '';
  isLoading: boolean = false;
  generatedDate: Date | null = null;

  generateReport() {
    this.isLoading = true;
    this.reportContent = '';
    this.dashboardService.generateAiReport(this.reportType).subscribe({
      next: (res) => {
        this.reportContent = res.report;
        this.generatedDate = new Date();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Report error:', err);
        alert('Failed to generate report. Please try again.');
        this.isLoading = false;
      }
    });
  }

  downloadPdf() {
    if (!this.reportContent) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(`Kudumbashree ${this.reportType} Report`, 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${this.generatedDate?.toLocaleString()}`, 20, 30);
    
    // Content
    doc.setFontSize(12);
    
    // Simple text wrapping
    const splitText = doc.splitTextToSize(this.reportContent.replace(/\*\*/g, ''), 170); // simplistic markdown strip
    doc.text(splitText, 20, 40);
    
    doc.save(`kudumbashree_${this.reportType.toLowerCase()}_report.pdf`);
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DashboardService } from '../../services/dashboard.service';
import { trigger, transition, style, animate } from '@angular/animations';
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
  styleUrls: ['./reports.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ReportsComponent {
  dashboardService = inject(DashboardService);
  sanitizer = inject(DomSanitizer);

  reportType: string = 'Loan';
  reportContent: string = '';
  renderedHtml: SafeHtml = '';
  isLoading: boolean = false;
  generatedDate: Date | null = null;

  generateReport() {
    this.isLoading = true;
    this.reportContent = '';
    this.renderedHtml = '';
    this.dashboardService.generateAiReport(this.reportType).subscribe({
      next: (res) => {
        this.reportContent = res.report;
        this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(res.report));
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

  /**
   * Lightweight markdown-to-HTML converter for Gemini output.
   * Handles: headers, bold, italic, lists, tables, horizontal rules, code blocks, and paragraphs.
   */
  private markdownToHtml(md: string): string {
    if (!md) return '';

    let html = md;

    // Code blocks (```...```)
    html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Tables: detect lines with pipes
    html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (match, headerRow, separator, bodyRows) => {
      const headers = headerRow.split('|').filter((c: string) => c.trim() !== '');
      const rows = bodyRows.trim().split('\n').map((row: string) =>
        row.split('|').filter((c: string) => c.trim() !== '')
      );

      let table = '<div class="table-wrapper"><table><thead><tr>';
      headers.forEach((h: string) => table += `<th>${h.trim()}</th>`);
      table += '</tr></thead><tbody>';
      rows.forEach((row: string[]) => {
        table += '<tr>';
        row.forEach((cell: string) => table += `<td>${cell.trim()}</td>`);
        table += '</tr>';
      });
      table += '</tbody></table></div>';
      return table;
    });

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Horizontal rule
    html = html.replace(/^---+$/gm, '<hr>');

    // Bold & italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Unordered lists
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Line breaks into paragraphs (only for remaining orphan lines)
    html = html.replace(/\n\n+/g, '</p><p>');

    // Single newlines
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>\s*<(h[1-4]|hr|ul|ol|table|pre|div)/g, '<$1');
    html = html.replace(/<\/(h[1-4]|hr|ul|ol|table|pre|div)>\s*<\/p>/g, '</$1>');

    return html;
  }

  downloadPdf() {
    if (!this.reportContent) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Header background
    doc.setFillColor(216, 27, 96);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Kudumbashree ${this.reportType} Report`, margin, 25);
    
    // Date
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${this.generatedDate?.toLocaleString()}`, margin, 35);
    
    yPos = 50;

    // Content
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const plainText = this.reportContent
      .replace(/#{1,4}\s*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/---+/g, '────────────────────────')
      .replace(/\|/g, '  ');

    const lines = doc.splitTextToSize(plainText, contentWidth);

    for (const line of lines) {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 6;
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('WardConnect - Kudumbashree Module', margin, pageHeight - 10);
    }

    doc.save(`kudumbashree_${this.reportType.toLowerCase()}_report.pdf`);
  }
}

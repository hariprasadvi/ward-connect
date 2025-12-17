import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

import { TranslationService } from '../../services/translation.service';

interface ReportType {
  title: string;
  description: string;
  icon: string;
  type: string;
}

@Component({
  selector: 'app-reports-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule
  ],
  templateUrl: './reports-analytics.component.html',
  styleUrl: './reports-analytics.component.scss'
})
export class ReportsAnalyticsComponent {
  private translationService = inject(TranslationService);

  translations = this.translationService.translations$;

  reportTypes: ReportType[] = [
    {
      title: 'MEETING_REPORTS',
      description: 'MEETING_REPORTS_DESC',
      icon: 'event',
      type: 'meeting'
    },
    {
      title: 'LOAN_REPORTS',
      description: 'LOAN_REPORTS_DESC',
      icon: 'account_balance',
      type: 'loan'
    },
    {
      title: 'ATTENDANCE_REPORTS',
      description: 'ATTENDANCE_REPORTS_DESC',
      icon: 'bar_chart',
      type: 'attendance'
    },
    {
      title: 'FINANCIAL_REPORTS',
      description: 'FINANCIAL_REPORTS_DESC',
      icon: 'pie_chart',
      type: 'financial'
    }
  ];

  generateReport(reportType: string) {
    alert(`Generating ${reportType} report...`);
    // Implement report generation logic
  }

  // Add the missing getTranslation method
  getTranslation(key: string): string {
    return (this.translations() as any)[key] || key;
  }
}
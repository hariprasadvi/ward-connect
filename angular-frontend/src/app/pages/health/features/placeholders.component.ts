import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-health-record-vault',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="p-8 text-center text-gray-500">
      <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 1rem;">security</mat-icon>
      <h2 class="text-2xl font-bold mb-2">Health Record Vault</h2>
      <p>Secure medical record storage is coming soon.</p>
    </div>
  `
})
export class HealthRecordVaultComponent { }

@Component({
    selector: 'app-community-dashboard',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="p-8 text-center text-gray-500">
      <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 1rem;">groups</mat-icon>
      <h2 class="text-2xl font-bold mb-2">Community Dashboard</h2>
      <p>Local health trends and alerts are coming soon.</p>
    </div>
  `
})
export class CommunityDashboardComponent { }

@Component({
    selector: 'app-insurance-checker',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="p-8 text-center text-gray-500">
      <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 1rem;">description</mat-icon>
      <h2 class="text-2xl font-bold mb-2">Insurance Checker</h2>
      <p>Eligibility checking for health schemes is coming soon.</p>
    </div>
  `
})
export class InsuranceCheckerComponent { }

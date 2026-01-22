import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-health-record-vault',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <div class="w-20 h-20 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
          <mat-icon style="font-size: 40px; width: 40px; height: 40px;">enhanced_encryption</mat-icon>
        </div>
        <h1 class="text-3xl font-bold mb-2">Health Vault</h1>
        <p class="text-gray-500">End-to-end encrypted storage for your sensitive medical records.</p>
      </div>

      <div class="bg-transparent border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center mb-8 hover:bg-gray-50 transition-colors cursor-pointer group"
           (click)="fileInput.click()">
        <input #fileInput type="file" (change)="onFileSelected($event)" hidden>
        <p class="mb-4 text-gray-500 group-hover:text-gray-600">Drag and drop files here, or click to upload</p>
        <button class="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
                (click)="$event.stopPropagation(); fileInput.click()">
          <mat-icon>upload_file</mat-icon> Upload New Record
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-lg text-gray-800">Stored Records ({{records.length}})</h3>
          <button (click)="locked = !locked"
                  class="px-4 py-2 rounded-lg text-white font-medium text-sm flex items-center gap-2 transition-all"
                  [style.background]="locked ? '#f43f5e' : 'var(--secondary)'">
            <mat-icon class="text-sm w-4 h-4 text-[16px] leading-none flex items-center">{{locked ? 'lock' : 'visibility_off'}}</mat-icon>
            {{locked ? 'Decrypt' : 'Hide'}}
          </button>
        </div>

        <div class="divide-y divide-gray-100">
          <div *ngFor="let rec of records" class="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-white rounded-lg border border-gray-200">
                <mat-icon [class.text-indigo-500]="!locked" [class.text-gray-400]="locked">description</mat-icon>
              </div>
              
              <div>
                <div class="font-bold text-gray-800 font-mono text-base">
                  {{locked ? '••••••••••••••••••••' : rec.name}}
                </div>
                <div class="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <span>{{locked ? '••••-••-••' : rec.date}}</span>
                  <span>•</span>
                  <span class="text-xs bg-gray-100 px-2 py-0.5 rounded uppercase font-semibold tracking-wide">
                    {{locked ? '•••' : rec.type}}
                  </span>
                </div>
              </div>
            </div>

            <button [disabled]="locked" 
                    class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    [class.text-indigo-500]="!locked"
                    [class.text-gray-300]="locked"
                    [class.cursor-not-allowed]="locked">
              <mat-icon>download</mat-icon>
            </button>
          </div>
        </div>
        
        <div class="p-4 bg-rose-50 text-rose-500 text-sm flex items-center gap-2 border-t border-rose-100">
           <mat-icon class="text-sm w-4 h-4 flex items-center">lock</mat-icon> Your records are encrypted with AES-256 bit encryption.
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0ea5e9;
      --secondary: #6366f1;
    }
  `]
})
export class HealthRecordVaultComponent {
  locked = true;
  records = [
    { id: 1, name: 'Annual Physical Results', date: '2025-12-10', type: 'PDF' },
    { id: 2, name: 'Vaccination History', date: '2024-05-20', type: 'PDF' },
    { id: 3, name: 'Dental X-Ray', date: '2025-01-15', type: 'JPG' },
  ];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      this.records.unshift({
        id: Date.now(),
        name: file.name,
        date: new Date().toISOString().split('T')[0],
        type: extension
      });
    }
  }
}

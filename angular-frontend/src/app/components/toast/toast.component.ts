import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-20 right-5 z-50 flex flex-col gap-2">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="min-w-[300px] p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out animate-slide-in"
           [ngClass]="getClasses(toast.type)">
        <div class="flex justify-between items-start">
          <p class="font-medium text-sm">{{ toast.message }}</p>
          <button (click)="toastService.remove(toast.id)" class="text-xs hover:opacity-70 ml-2">✕</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out forwards;
    }
  `]
})
export class ToastComponent {
    constructor(public toastService: ToastService) { }

    getClasses(type: string): string {
        switch (type) {
            case 'success': return 'bg-white border-green-500 text-gray-800 shadow-green-100';
            case 'error': return 'bg-white border-red-500 text-gray-800 shadow-red-100';
            case 'warning': return 'bg-white border-yellow-500 text-gray-800 shadow-yellow-100';
            default: return 'bg-white border-blue-500 text-gray-800 shadow-blue-100'; // info
        }
    }
}

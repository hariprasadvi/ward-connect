import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  modules = [
    { id: 'kudumbashree', title: 'MOD_KUDUMBASHREE', icon: '👥' },
    { id: 'vehicle', title: 'MOD_VEHICLE', icon: '🚗' },
    { id: 'health', title: 'MOD_HEALTH', icon: '🏥' },
    { id: 'shop', title: 'MOD_SHOP', icon: '🛍️' },
    { id: 'utility', title: 'MOD_UTILITY', icon: '🧾' },
    { id: 'job', title: 'MOD_JOB', icon: '🎓' },
    { id: 'env', title: 'MOD_ENV', icon: '🌿' },
    { id: 'civic', title: 'MOD_CIVIC', icon: '🛠️' }
  ];

  constructor(private router: Router) { }

  navigate(moduleId: string) {
    if (moduleId === 'job') {
      this.router.navigate(['/job']);
    } else {
      alert('Module Under Construction (Coming Soon)');
    }
  }
}

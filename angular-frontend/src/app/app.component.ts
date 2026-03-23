import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from './components/toast/toast.component';
import { MedicineAlarmService } from './services/medicine-alarm.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-frontend';
  showNavbar = true;
  private alarmService = inject(MedicineAlarmService);

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      // Hide navbar on landing, login, and signup pages
      this.showNavbar = !['/', '/login', '/signup'].includes(this.router.url);
    });
  }

  ngOnInit() {
    this.alarmService.start();
  }
}

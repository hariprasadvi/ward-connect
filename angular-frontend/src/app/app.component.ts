import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from './components/toast/toast.component';

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

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      // Hide navbar only on the exact landing page route '/'
      this.showNavbar = this.router.url !== '/';
    });
  }
}

import { Component } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private translationService: TranslationService, public router: Router) { }

  switchLang(lang: string) {
    this.translationService.switchLanguage(lang);
  }

  logout() {
    alert('Logged out');
  }
}

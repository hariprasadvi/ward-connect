import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private currentLang = new BehaviorSubject<string>('en');
    public currentLang$ = this.currentLang.asObservable();

    private translations: any = {};

    constructor(private http: HttpClient) {
        this.loadTranslations('en');
    }

    switchLanguage(lang: string) {
        this.currentLang.next(lang);
        this.loadTranslations(lang);
    }

    private loadTranslations(lang: string) {
        this.http.get(`/assets/i18n/${lang}.json`).subscribe(
            (data) => {
                this.translations = data;
            },
            (error) => console.error('Error loading translations', error)
        );
    }

    translate(key: string): string {
        return this.translations[key] || key;
    }

    // Helper for templates if using pipe (not using pipe for now, just direct service usage or signal)
    // Ideally we use a Pipe, but for simplicity I will expose the translations object or method.
    get data() {
        return this.translations;
    }
}

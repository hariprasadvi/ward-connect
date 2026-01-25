import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
    name: 'markdown',
    standalone: true
})
export class MarkdownPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string): SafeHtml {
        if (!value) return '';

        try {
            const html = marked.parse(value) as string;
            return this.sanitizer.bypassSecurityTrustHtml(html);
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return value;
        }
    }
}

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'markdown',
    standalone: true
})
export class MarkdownPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string): SafeHtml {
        if (!value) return '';

        let html = value
            // Escape HTML (prevent XSS)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')

            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')

            // Italic
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')

            // Unordered Lists (Simple)
            .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
            // Wrap LI in UL (Simplistic approach: might need CSS to handle loose LIs)

            // Code Blocks
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')

            // Inline Code
            .replace(/`([^`]+)`/gim, '<code>$1</code>')

            // Newlines to BR
            .replace(/\n/gim, '<br>');

        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}

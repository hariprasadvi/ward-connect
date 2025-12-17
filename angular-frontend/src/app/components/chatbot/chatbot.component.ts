import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
    selector: 'app-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule, MarkdownPipe],
    templateUrl: './chatbot.component.html'
})
export class ChatbotComponent {
    messages: { role: string, text: string }[] = [
        { role: 'model', text: 'Hello! I am your AI Career Assistant. Ask me about learning roadmaps, skills, or job market trends.' }
    ];
    userInput = '';
    loading = false;

    constructor(private jobService: JobService) { }

    sendMessage() {
        if (!this.userInput.trim()) return;

        this.messages.push({ role: 'user', text: this.userInput });
        const userMsg = this.userInput;
        this.userInput = '';
        this.loading = true;

        // Convert chat history for Gemini (excluding the new user message which is passed separately)
        // Convert chat history for Gemini (excluding the new user message which is passed separately)
        // AND ensuring we don't send the initial 'model' greeting as the first history item
        const history = this.messages.slice(0, -1)
            .filter(m => m.role !== 'model' || this.messages.indexOf(m) !== 0) // Skip first message if it's model
            .map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));

        this.jobService.sendChatMessage(history, userMsg).subscribe({
            next: (res) => {
                this.messages.push({ role: 'model', text: res.response });
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                const errorMsg = err.error?.error || err.message || 'Unknown error';
                this.messages.push({ role: 'model', text: `Error: ${errorMsg}. (Status: ${err.status})` });
                this.loading = false;
            }
        });
    }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';

@Component({
    selector: 'app-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule],
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
        const history = this.messages.slice(0, -1).map(m => ({
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
                this.messages.push({ role: 'model', text: 'Sorry, I encountered an error. Please check your API Key.' });
                this.loading = false;
            }
        });
    }
}

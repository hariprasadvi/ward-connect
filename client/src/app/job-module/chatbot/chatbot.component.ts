import { Component } from '@angular/core';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  messages: { role: string, text: string }[] = [];
  userInput = '';
  isLoading = false;

  constructor(private jobService: JobService) {
    this.messages.push({ role: 'model', text: 'Hello! I am your E-learning assistant. How can I help you regarding courses and career roadmaps?' });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const msg = this.userInput;
    this.messages.push({ role: 'user', text: msg });
    this.userInput = '';
    this.isLoading = true;

    // Prepare history excluding the just added user message for the API call context if needed, 
    // but the API takes message + history. 
    // Let's pass the previous messages as history.
    const history = this.messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    this.jobService.chat(msg, history).subscribe({
      next: (res) => {
        this.messages.push({ role: 'model', text: res.reply });
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.messages.push({ role: 'model', text: 'Sorry, I am having trouble connecting to the server.' });
        this.isLoading = false;
      }
    });
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CivicRequestService } from '../../services/civic-request.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-civic-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './civic-requests.component.html',
    styleUrls: ['./civic-requests.component.css']
})
export class CivicRequestsComponent implements OnInit {
    activeTab: 'landing' | 'report' | 'status' | 'help' = 'landing';
    step: number = 1; // 1: Form, 2: Preview

    // Form Data
    formData = {
        title: '',
        description: '',
        location: '',
        mediaUrl: ''
    };

    requests: any[] = [];
    isLoading: boolean = false;

    constructor(
        private civicService: CivicRequestService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.civicService.getRequests().subscribe({
            next: (data: any[]) => this.requests = data,
            error: (err: any) => console.error('Error loading requests', err)
        });
    }

    setTab(tab: any) {
        this.activeTab = tab;
        if (tab === 'report') {
            this.step = 1;
        }
    }

    nextStep() {
        if (!this.formData.title || !this.formData.description || !this.formData.location) {
            alert('Please fill in all required fields');
            return;
        }
        this.step = 2;
    }

    prevStep() {
        this.step = 1;
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            // For demo purposes, we'll use a local object URL or a placeholder
            // In a real app, you'd upload this to a server first
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.formData.mediaUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    submitReport() {
        this.isLoading = true;
        this.civicService.createRequest(this.formData).subscribe({
            next: (res: any) => {
                alert('Complaint submitted successfully!');
                this.isLoading = false;
                this.activeTab = 'status';
                this.loadRequests();
                this.resetForm();
            },
            error: (err: any) => {
                console.error(err);
                this.isLoading = false;
                const errMsg = err.error?.message || err.error?.error || 'Failed to submit complaint';
                alert(errMsg);
            }
        });
    }

    resetForm() {
        this.formData = {
            title: '',
            description: '',
            location: '',
            mediaUrl: ''
        };
        this.step = 1;
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'Pending': return '#f39c12';
            case 'Assigned': return '#3498db';
            case 'In-Progress': return '#9b59b6';
            case 'Resolved': return '#2ecc71';
            case 'Closed': return '#7f8c8d';
            default: return '#95a5a6';
        }
    }
}

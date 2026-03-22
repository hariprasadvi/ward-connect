import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CivicRequestService } from '../../services/civic-request.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-civic-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './civic-requests.component.html',
    styleUrls: ['./civic-requests.component.css']
})
export class CivicRequestsComponent implements OnInit {
    activeTab: 'landing' | 'report' | 'status' | 'analytics' | 'help' | 'notifications' = 'landing';
    step: number = 1;

    formData = {
        title: '',
        description: '',
        location: '',
        mediaUrl: ''
    };

    requests: any[] = [];
    notifications: any[] = [];
    isLoading: boolean = false;
    showSuccessModal: boolean = false;
    user: any;
    isAdmin: boolean = false;

    // Filters & States
    searchQuery: string = '';
    statusFilter: string = 'All';
    selectedRequest: any = null;
    isEditingDetails: boolean = false;
    editFormData: { status: string, adminResponse: string } = { status: '', adminResponse: '' };

    constructor(
        private civicService: CivicRequestService,
        private authService: AuthService,
        private router: Router
    ) { 
        this.user = this.authService.getCurrentUser();
        if (this.user && (this.user.role === 'Panchayat Admin' || this.user.role === 'Ward Member')) {
            this.isAdmin = true;
            this.activeTab = 'status';
        }
    }

    ngOnInit() {
        this.loadRequests();
        this.loadNotifications();
    }

    loadRequests() {
        this.civicService.getRequests().subscribe({
            next: (data: any[]) => this.requests = data,
            error: (err: any) => console.error('Error loading requests', err)
        });
    }

    loadNotifications() {
        this.civicService.getNotifications().subscribe({
            next: (data: any[]) => this.notifications = data,
            error: (err: any) => console.error('Error loading notifications', err)
        });
    }

    get unreadNotificationCount() {
        return this.notifications.filter(n => !n.isRead).length;
    }

    get totalComplaints() { return this.requests.length; }
    get pendingComplaints() { return this.requests.filter(r => ['Pending', 'Assigned', 'In-Progress'].includes(r.status)).length; }
    get resolvedComplaints() { return this.requests.filter(r => ['Resolved', 'Closed'].includes(r.status)).length; }

    get analyticsData() {
        const wards: any = {};
        const timeline: any = {};
        const today = new Date();
        today.setHours(0,0,0,0);

        // Initialize last 7 days for timeline
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            timeline[d.toISOString().split('T')[0]] = { count: 0, dateLabel: d.toLocaleDateString('en-US', { weekday: 'short' }) };
        }

        this.requests.forEach(req => {
            const isResolved = ['Resolved', 'Closed'].includes(req.status);
            
            // Location Stats
            const loc = req.location || 'Unspecified';
            if (!wards[loc]) wards[loc] = { total: 0, resolved: 0, pending: 0 };
            wards[loc].total++;
            if (isResolved) wards[loc].resolved++;
            else wards[loc].pending++;

            // Timeline Stats
            const reqDate = new Date(req.createdAt).toISOString().split('T')[0];
            if (timeline[reqDate]) {
                timeline[reqDate].count++;
            }
        });

        const wardStats = Object.keys(wards).map(k => ({
            name: k,
            total: wards[k].total,
            resolved: wards[k].resolved,
            pending: wards[k].pending,
            resolutionRate: wards[k].total > 0 ? Math.round((wards[k].resolved / wards[k].total) * 100) : 0
        })).sort((a, b) => b.total - a.total);

        const timelineStats = Object.keys(timeline).map(k => ({
            date: timeline[k].dateLabel,
            count: timeline[k].count
        }));
        
        const maxTimelineValue = Math.max(...timelineStats.map(t => t.count), 1); // Avoid div by 0

        const globalResolutionRate = this.totalComplaints > 0 ? Math.round((this.resolvedComplaints / this.totalComplaints) * 100) : 0;
        const globalPendingPercent = this.totalComplaints > 0 ? 100 - globalResolutionRate : 0;

        return { wardStats, timelineStats, maxTimelineValue, globalResolutionRate, globalPendingPercent };
    }

    get filteredRequests() {
        return this.requests.filter(req => {
            const matchesSearch = 
                req.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                req.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (req.User?.full_name?.toLowerCase().includes(this.searchQuery.toLowerCase()));
            
            const matchesStatus = this.statusFilter === 'All' || req.status === this.statusFilter;
            return matchesSearch && matchesStatus;
        });
    }

    setTab(tab: any) {
        this.activeTab = tab;
        this.selectedRequest = null;
        if (tab === 'report') this.step = 1;

        if (tab === 'notifications' && this.unreadNotificationCount > 0) {
            this.civicService.markNotificationsAsRead().subscribe({
                next: () => {
                    this.notifications.forEach(n => n.isRead = true);
                },
                error: (err) => console.error('Failed to mark notifications read', err)
            });
        }
    }

    nextStep() {
        if (!this.formData.title || !this.formData.description || !this.formData.location) {
            alert('Please fill in all required fields');
            return;
        }
        this.step = 2;
    }

    prevStep() { this.step = 1; }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => { this.formData.mediaUrl = e.target.result; };
            reader.readAsDataURL(file);
        }
    }

    submitReport() {
        this.isLoading = true;
        this.civicService.createRequest(this.formData).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                this.showSuccessModal = true;
            },
            error: (err: any) => {
                console.error(err);
                this.isLoading = false;
                alert('Failed to submit complaint');
            }
        });
    }

    closeSuccessModal() {
        this.showSuccessModal = false;
        this.activeTab = 'status';
        this.loadRequests();
        this.formData = { title: '', description: '', location: '', mediaUrl: '' };
        this.step = 1;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Resolved':
            case 'Closed': 
                return 'status-green';
            case 'Pending':
            case 'Assigned':
            case 'In-Progress': 
                return 'status-orange';
            default: 
                return 'status-gray';
        }
    }

    // Analytics Print Functionality
    get currentDate() {
        return new Date();
    }

    printAnalytics() {
        window.print();
    }

    calculatePendingDays(req: any): string {
        if (['Resolved', 'Closed'].includes(req.status)) return 'Resolved';
        const d1 = new Date(req.createdAt).getTime();
        const d2 = new Date().getTime();
        const diff = Math.floor((d2 - d1) / (1000 * 3600 * 24));
        return diff === 0 ? 'Today' : `${diff} days`;
    }

    viewDetails(req: any) {
        this.selectedRequest = req;
        this.isEditingDetails = false;
    }

    closeDetails() {
        this.selectedRequest = null;
        this.isEditingDetails = false;
    }

    startDetailedEdit(req: any) {
        this.isEditingDetails = true;
        this.editFormData = {
            status: req.status,
            adminResponse: req.adminResponse || ''
        };
    }

    cancelDetailedEdit() {
        this.isEditingDetails = false;
    }

    saveDetailedEdit(reqId: number) {
        this.civicService.updateRequestStatus(reqId, this.editFormData).subscribe({
            next: (res: any) => {
                alert('Status updated successfully!');
                this.isEditingDetails = false;
                this.selectedRequest.status = this.editFormData.status;
                this.selectedRequest.adminResponse = this.editFormData.adminResponse;
                this.loadRequests();
            },
            error: (err: any) => {
                console.error(err);
                alert('Failed to update request status: ' + (err.error?.message || err.message));
            }
        });
    }
}

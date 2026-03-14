import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { TranslationService } from '../../services/translation.service';
import { DashboardService } from '../../services/dashboard.service';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  communityUnit: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'pending';
  is_approved: boolean; // Added to fix build error
  totalLoans: number;
  activeLoans: number;
  attendanceRate: number;
}

@Component({
  selector: 'app-member-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './member-management.component.html',
  styleUrl: './member-management.component.scss'
})
export class MemberManagementComponent implements OnInit {
  private translationService = inject(TranslationService);
  private dialog = inject(MatDialog);

  translations = this.translationService.translations$;

  members: Member[] = [];
  filteredMembers: Member[] = [];
  displayedColumns: string[] = ['name', 'contact', 'unit', 'joinDate', 'status', 'loans', 'actions'];
  
  // Statistics
  totalMembers: number = 0;
  activeMembers: number = 0;
  pendingMembers: number = 0;
  totalActiveLoans: number = 0;
  
  // Filter properties
  searchTerm: string = '';
  statusFilter: string = 'all';
  unitFilter: string = 'all';

  private dashboardService = inject(DashboardService);
  // translations/dialog already injected

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.dashboardService.getAllMembers().subscribe({
      next: (members) => {
        this.members = members.map((m: any) => ({
          id: m.id?.toString() || '',
          name: m.full_name || m.name,
          email: m.email,
          phone: m.mobile_number || m.phone || '',
          communityUnit: m.ward_number || m.communityUnit,
          joinDate: new Date(),
          is_approved: m.is_approved, // Map from backend
          status: m.is_approved ? 'active' : 'pending', // Derive status
          totalLoans: 0,
          activeLoans: 0,
          attendanceRate: 0
        }));
        this.filteredMembers = [...this.members];
        this.calculateStatistics();
      },
      error: (err) => console.error('Error loading members:', err)
    });
  }

  calculateStatistics() {
    this.totalMembers = this.members.length;
    this.activeMembers = this.members.filter(m => m.status === 'active').length;
    this.pendingMembers = this.members.filter(m => m.status === 'pending').length;
    this.totalActiveLoans = this.members.reduce((sum, m) => sum + m.activeLoans, 0);
  }

  applyFilters() {
    this.filteredMembers = this.members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          member.communityUnit.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || member.status === this.statusFilter;
      const matchesUnit = this.unitFilter === 'all' || member.communityUnit === this.unitFilter;

      return matchesSearch && matchesStatus && matchesUnit;
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusTranslation(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'pending': 'Pending'
    };
    return statusMap[status] || status;
  }

  approveMember(member: Member) {
    if (confirm(`Are you sure you want to approve ${member.name}?`)) {
        this.dashboardService.approveMember(member.id).subscribe({
            next: () => {
                member.status = 'active';
                member.is_approved = true;
                this.calculateStatistics();
            },
            error: (err) => alert('Failed to approve member: ' + (err.error?.message || err.message))
        });
    }
  }

  deleteMember(member: Member) {
      if(confirm(`Are you sure you want to DELETE ${member.name}? This action cannot be undone.`)) {
          this.dashboardService.deleteMember(member.id).subscribe({
              next: () => {
                  alert('Member deleted successfully');
                  this.loadMembers(); // Refresh list
              },
              error: (err) => alert('Failed to delete member: ' + (err.error?.message || err.message))
          });
      }
  }

  viewMemberDetails(member: Member) {
    // Implement view details dialog
    console.log('View details for:', member.name);
  }

  editMember(member: Member) {
    // Implement edit member dialog
    console.log('Edit member:', member.name);
  }

  viewPaymentHistory(member: Member) {
    // Implement payment history view
    console.log('View payment history for:', member.name);
  }

  getUniqueUnits(): string[] {
    return [...new Set(this.members.map(member => member.communityUnit))];
  }
}

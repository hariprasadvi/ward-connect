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

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  communityUnit: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'pending';
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

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    // Simulate API call
    setTimeout(() => {
      this.members = [
        {
          id: '1',
          name: 'Rani S',
          email: 'rani@community.com',
          phone: '9876543210',
          communityUnit: 'Unit 5A',
          joinDate: new Date('2024-01-15'),
          status: 'active',
          totalLoans: 2,
          activeLoans: 1,
          attendanceRate: 95
        },
        {
          id: '2',
          name: 'Lakshmi M',
          email: 'lakshmi@community.com',
          phone: '9876543211',
          communityUnit: 'Unit 3B',
          joinDate: new Date('2024-01-10'),
          status: 'active',
          totalLoans: 1,
          activeLoans: 0,
          attendanceRate: 88
        },
        {
          id: '3',
          name: 'Geetha P',
          email: 'geetha@community.com',
          phone: '9876543212',
          communityUnit: 'Unit 7C',
          joinDate: new Date('2024-01-08'),
          status: 'pending',
          totalLoans: 0,
          activeLoans: 0,
          attendanceRate: 0
        },
        {
          id: '4',
          name: 'Sunitha R',
          email: 'sunitha@community.com',
          phone: '9876543213',
          communityUnit: 'Unit 2D',
          joinDate: new Date('2024-01-05'),
          status: 'active',
          totalLoans: 3,
          activeLoans: 2,
          attendanceRate: 92
        },
        {
          id: '5',
          name: 'Meena K',
          email: 'meena@community.com',
          phone: '9876543214',
          communityUnit: 'Unit 8E',
          joinDate: new Date('2024-01-03'),
          status: 'inactive',
          totalLoans: 1,
          activeLoans: 0,
          attendanceRate: 45
        }
      ];
      this.filteredMembers = [...this.members];
      this.calculateStatistics();
    }, 1000);
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
    member.status = 'active';
    this.calculateStatistics();
    // In real app, call API to update member status
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
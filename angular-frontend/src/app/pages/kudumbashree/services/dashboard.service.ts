import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DashboardStats, MemberDashboard, FinancialSummary, Activity } from '../models/dashboard';
import { User, UserRole } from '../models/user';
import { Loan, LoanStatus } from '../models/loan';
import { Meeting } from '../models/meeting';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  getAdminDashboard(): Observable<DashboardStats> {
    return of({
      totalMembers: 156,
      activeMembers: 142,
      totalMeetings: 48,
      upcomingMeetings: 3,
      totalLoans: 89,
      pendingLoans: 12,
      totalLoanAmount: 2450000,
      recoveredAmount: 1875000,
      pendingAmount: 575000,
      attendanceRate: 85
    }).pipe(delay(800));
  }

  getMemberDashboard(userId: string): Observable<MemberDashboard> {
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'meeting',
        title: 'Monthly General Meeting',
        description: 'Attended monthly community meeting',
        date: new Date('2024-01-15'),
        status: 'completed'
      },
      {
        id: '2',
        type: 'loan',
        title: 'Loan Application Approved',
        description: 'Your loan application for ₹25,000 has been approved',
        date: new Date('2024-01-10'),
        status: 'completed'
      },
      {
        id: '3',
        type: 'payment',
        title: 'EMI Payment',
        description: 'Monthly EMI of ₹2,500 paid successfully',
        date: new Date('2024-01-05'),
        status: 'completed'
      },
      {
        id: '4',
        type: 'meeting',
        title: 'Upcoming Training Session',
        description: 'Skill development workshop scheduled',
        date: new Date('2024-01-25'),
        status: 'upcoming'
      }
    ];

    const mockUser: User = {
      id: userId,
      memberId: 'MEM001',
      name: 'Radha Krishnan',
      email: 'radha@kudumbashree.com',
      phone: '+919876543211',
      address: 'Ward 5, Thrissur, Kerala',
      role: UserRole.MEMBER,
      isActive: true,
      joinDate: new Date('2023-01-15'),
      groupId: 'GRP001',
      groupName: 'Shakthi Group',
      aadharNumber: '123456789012',
      bankAccount: '12345678901234',
      ifscCode: 'SBIN0000123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of({
      user: mockUser,
      stats: {
        meetingsAttended: 12,
        totalMeetings: 15,
        attendanceRate: 80,
        loansTaken: 3,
        activeLoans: 1,
        totalLoanAmount: 75000,
        repaidAmount: 45000,
        pendingAmount: 30000,
        nextMeeting: {
          id: '4',
          title: 'Skill Development Workshop',
          date: new Date('2024-01-25'),
          location: 'Community Hall',
          description: 'Training session on handicraft making'
        } as Meeting,
        recentActivities: mockActivities
      }
    }).pipe(delay(600));
  }

  getFinancialSummary(): Observable<FinancialSummary> {
    const monthlyCollections = [
      { month: 'Jan', year: 2024, totalCollection: 125000, target: 150000, achieved: 83 },
      { month: 'Dec', year: 2023, totalCollection: 142000, target: 140000, achieved: 101 },
      { month: 'Nov', year: 2023, totalCollection: 138000, target: 140000, achieved: 99 },
      { month: 'Oct', year: 2023, totalCollection: 131000, target: 135000, achieved: 97 },
      { month: 'Sep', year: 2023, totalCollection: 127000, target: 130000, achieved: 98 },
      { month: 'Aug', year: 2023, totalCollection: 119000, target: 125000, achieved: 95 }
    ];

    return of({
      totalFunds: 3500000,
      availableBalance: 1250000,
      totalLoansDisbursed: 2450000,
      totalRepayments: 1875000,
      pendingCollections: 575000,
      monthlyCollections
    }).pipe(delay(700));
  }

  getAllMembers(): Observable<User[]> {
    // Mock members data
    const members: User[] = [
      {
        id: '2',
        memberId: 'MEM001',
        name: 'Radha Krishnan',
        email: 'radha@kudumbashree.com',
        phone: '+919876543211',
        address: 'Ward 5, Thrissur, Kerala',
        role: UserRole.MEMBER,
        isActive: true,
        joinDate: new Date('2023-01-15'),
        groupId: 'GRP001',
        groupName: 'Shakthi Group',
        aadharNumber: '123456789012',
        bankAccount: '12345678901234',
        ifscCode: 'SBIN0000123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        memberId: 'MEM002',
        name: 'Lakshmi Devi',
        email: 'lakshmi@kudumbashree.com',
        phone: '+919876543212',
        address: 'Ward 7, Ernakulam, Kerala',
        role: UserRole.MEMBER,
        isActive: true,
        joinDate: new Date('2023-02-20'),
        groupId: 'GRP001',
        groupName: 'Shakthi Group',
        aadharNumber: '123456789013',
        bankAccount: '12345678901235',
        ifscCode: 'SBIN0000123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        memberId: 'MEM003',
        name: 'Santha Kumari',
        email: 'santha@kudumbashree.com',
        phone: '+919876543213',
        address: 'Ward 3, Palakkad, Kerala',
        role: UserRole.MEMBER,
        isActive: true,
        joinDate: new Date('2023-03-10'),
        groupId: 'GRP002',
        groupName: 'Jyothi Group',
        aadharNumber: '123456789014',
        bankAccount: '12345678901236',
        ifscCode: 'SBIN0000124',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return of(members).pipe(delay(500));
  }
}
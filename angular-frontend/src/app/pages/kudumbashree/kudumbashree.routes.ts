import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/kudumbashree-entry/kudumbashree-entry.component').then(m => m.KudumbashreeEntryComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  // Member routes
  {
    path: 'member/dashboard',
    loadComponent: () => import('./components/member-dashboard/member-dashboard.component').then(m => m.MemberDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'member' }
  },
  {
    path: 'attendance',
    loadComponent: () => import('./components/attendance/attendance.component').then(m => m.AttendanceComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'member' }
  },
  {
    path: 'loans',
    loadComponent: () => import('./components/loan-management/loan-management.component').then(m => m.LoanManagementComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'member' }
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/member-profile/member-profile.component').then(m => m.MemberProfileComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'member' }
  },
  {
    path: 'payments',
    loadComponent: () => import('./components/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'member' }
  },
  // Admin routes
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/members',
    loadComponent: () => import('./components/member-management/member-management.component').then(m => m.MemberManagementComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/loans',
    loadComponent: () => import('./components/admin-loan-management/admin-loan-management.component').then(m => m.AdminLoanManagementComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },

  {
  path: 'admin/payment-history',
  loadComponent: () => import('./components/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent),
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'admin' }
},
  {
    path: 'meeting-minutes',
    loadComponent: () => import('./components/meeting-minutes/meeting-minutes.component').then(m => m.MeetingMinutesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'meetings',
    loadComponent: () => import('./components/meeting-organizer/meeting-organizer.component').then(m => m.MeetingOrganizerComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports-analytics/reports-analytics.component').then(m => m.ReportsAnalyticsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  }
];
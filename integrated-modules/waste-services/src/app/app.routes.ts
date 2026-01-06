import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'user',
    canActivate: [authGuard, roleGuard([UserRole.USER])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent)
      },
      {
        path: 'bulk-pickup',
        loadComponent: () => import('./features/user/bulk-pickup/bulk-pickup.component').then(m => m.BulkPickupComponent)
      },
      {
        path: 'complaint',
        loadComponent: () => import('./features/user/complaint/complaint.component').then(m => m.ComplaintComponent)
      },
      {
        path: 'my-complaints',
        loadComponent: () => import('./features/user/my-complaints/my-complaints.component').then(m => m.MyComplaintsComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'manage-pickups',
        loadComponent: () => import('./features/admin/manage-pickups/manage-pickups.component').then(m => m.ManagePickupsComponent)
      },
      {
        path: 'schedule-pickup',
        loadComponent: () => import('./features/admin/schedule-pickup/admin-schedule-pickup.component').then(m => m.AdminSchedulePickupComponent)
      },
      {
        path: 'manage-complaints',
        loadComponent: () => import('./features/admin/manage-complaints/manage-complaints.component').then(m => m.ManageComplaintsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

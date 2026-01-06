import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';

// Redirect component
import { WasteRedirectComponent } from './waste-redirect.component';

export const WASTE_ROUTES: Routes = [
  {
    path: '',
    component: WasteRedirectComponent,
    canActivate: [authGuard]
  },
  {
    path: 'user',
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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
  }
];





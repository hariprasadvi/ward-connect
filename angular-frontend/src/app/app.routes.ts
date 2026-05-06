import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { LandingComponent } from './pages/landing/landing.component';

import { JobDashboardComponent } from './pages/job-dashboard/job-dashboard.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { CvGeneratorComponent } from './components/cv-generator/cv-generator.component';
import { JobAlertsComponent } from './components/job-alerts/job-alerts.component';
import { ApplicationHistoryComponent } from './pages/application-history/application-history.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'health',
    loadChildren: () => import('./pages/health/health.routes').then(m => m.HEALTH_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'kudumbashree',
    loadChildren: () => import('./pages/kudumbashree/kudumbashree.routes').then(m => m.routes)
  },
  {
    path: 'waste',
    loadChildren: () => import('./pages/waste/waste.routes').then(m => m.WASTE_ROUTES)
  },
  {
    path: 'vehicle',
    loadChildren: () => import('./pages/vehicle/vehicle.routes').then(m => m.routes)
  },
  {
    path: 'shop',
    loadChildren: () => import('./pages/shop/shop.routes').then(m => m.SHOP_ROUTES)
  },
  {
    path: 'jobs',
    component: JobDashboardComponent,
    children: [
      { path: '', redirectTo: 'alerts', pathMatch: 'full' },
      { path: 'chat', component: ChatbotComponent },
      { path: 'cv', component: CvGeneratorComponent },
      { path: 'alerts', component: JobAlertsComponent },
      { path: 'history', component: ApplicationHistoryComponent }
    ]
  },
  {
    path: 'civic-requests',
    loadComponent: () => import('./pages/civic-requests/civic-requests.component').then(m => m.CivicRequestsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'utilities',
    loadComponent: () => import('./pages/utility-bills/utility-bills.component').then(m => m.UtilityBillsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'utilities/electricity',
    loadComponent: () => import('./pages/utility-bills/electricity-bill/electricity-bill.component').then(m => m.ElectricityBillComponent),
    canActivate: [authGuard]
  },
  {
    path: 'utilities/water',
    loadComponent: () => import('./pages/utility-bills/water-bill/water-bill.component').then(m => m.WaterBillComponent),
    canActivate: [authGuard]
  },
  {
    path: 'utilities/gas',
    loadComponent: () => import('./pages/utility-bills/gas-booking/gas-booking.component').then(m => m.GasBookingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'utilities/history',
    loadComponent: () => import('./pages/utility-bills/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent),
    canActivate: [authGuard]
  },
  
  { path: '**', redirectTo: '' }
];

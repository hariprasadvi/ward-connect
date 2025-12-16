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

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    {
        path: 'jobs',
        component: JobDashboardComponent,
        children: [
            { path: '', redirectTo: 'alerts', pathMatch: 'full' },
            { path: 'chat', component: ChatbotComponent },
            { path: 'cv', component: CvGeneratorComponent },
            { path: 'alerts', component: JobAlertsComponent }
        ]
    },
    { path: '**', redirectTo: '' }
];

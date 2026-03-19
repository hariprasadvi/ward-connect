import { Routes } from '@angular/router';
import { HealthComponent } from './health.component';
import { MedicineReminderComponent } from './features/medicine-reminder.component';
import { DonationMatchingComponent } from './features/donation-matching.component';
import { HealthRecordVaultComponent } from './features/health-record-vault.component';
import { CommunityDashboardComponent } from './features/community-dashboard.component';
import { InsuranceCheckerComponent } from './features/insurance-checker.component';
import { OpBookingComponent } from './features/op-booking.component';

export const HEALTH_ROUTES: Routes = [
    {
        path: '',
        component: HealthComponent
    },
    {
        path: 'medicines',
        component: MedicineReminderComponent
    },
    {
        path: 'vault',
        component: HealthRecordVaultComponent
    },
    {
        path: 'dashboard',
        component: CommunityDashboardComponent
    },
    {
        path: 'donation',
        component: DonationMatchingComponent
    },
    {
        path: 'insurance',
        component: InsuranceCheckerComponent
    },
    {
        path: 'op-bookings',
        component: OpBookingComponent
    }
];

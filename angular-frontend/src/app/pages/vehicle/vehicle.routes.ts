import { Routes } from '@angular/router';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { VehicleEntryComponent } from './vehicle-entry/vehicle-entry.component';

export const routes: Routes = [
    { path: '', component: VehicleEntryComponent },
    { path: 'owner', component: OwnerDashboardComponent },
    { path: 'search', component: UserSearchComponent }
];

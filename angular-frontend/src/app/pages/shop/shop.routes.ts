import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';

// Seller Hub Components
import { SellerHubComponent } from './seller-hub/seller-hub.component';
import { SellerDashboardComponent } from './seller-hub/seller-dashboard/seller-dashboard.component';
import { ProductManagementComponent } from './seller-hub/product-management/product-management.component';
import { OrderManagementComponent } from './seller-hub/order-management/order-management.component';

export const SHOP_ROUTES: Routes = [
    { path: '', component: ProductListComponent },
    { path: 'product/:id', component: ProductDetailComponent },
    { path: 'cart', component: CartComponent },
    { path: 'wishlist', component: WishlistComponent },

    // Seller Hub Route
    {
        path: 'seller-hub',
        component: SellerHubComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: SellerDashboardComponent },
            { path: 'products', component: ProductManagementComponent },
            { path: 'orders', component: OrderManagementComponent }
        ]
    }
];

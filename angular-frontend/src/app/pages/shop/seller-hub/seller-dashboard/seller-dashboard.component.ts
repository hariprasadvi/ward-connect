import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../shop.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
       <!-- Welcome Header -->
       <div>
          <h2 class="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p class="text-gray-500">Welcome back! Here's what's happening with your shop today.</p>
       </div>

       <!-- Stats Grid -->
       <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Total Sales -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
             <div>
                <p class="text-sm font-medium text-gray-500 mb-1">Total Sales</p>
                <h3 class="text-2xl font-bold text-gray-900">₹{{ totalSales() }}</h3>
             </div>
             <div class="p-3 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </div>
          </div>

          <!-- Total Orders -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
             <div>
                <p class="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ totalOrders() }}</h3>
             </div>
             <div class="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
             </div>
          </div>

          <!-- Active Products -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
             <div>
                <p class="text-sm font-medium text-gray-500 mb-1">Active Products</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ activeProducts() }}</h3>
             </div>
             <div class="p-3 bg-violet-50 rounded-xl text-violet-600 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
             </div>
          </div>
       </div>

       <!-- Recent Orders Table (Snippet) -->
       <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
             <h3 class="font-bold text-gray-900">Recent Orders</h3>
             <button class="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
          </div>
          <div class="overflow-x-auto">
             <table class="w-full text-left">
                <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                   <tr>
                      <th class="px-6 py-4">Order ID</th>
                      <th class="px-6 py-4">Product</th>
                      <th class="px-6 py-4">Customer</th>
                      <th class="px-6 py-4">Status</th>
                      <th class="px-6 py-4">Amount</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                   <tr *ngFor="let order of recentOrders()" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 text-sm text-gray-900">#{{ order.id }}</td>
                      <td class="px-6 py-4">
                         <div class="flex items-center gap-3">
                            <img [src]="order.Product.image" class="w-10 h-10 rounded-lg object-cover bg-gray-100">
                            <span class="text-sm font-medium text-gray-900">{{ order.Product.title }}</span>
                         </div>
                      </td>
                       <td class="px-6 py-4 text-sm text-gray-500">
                          {{ order.Order.User.full_name }}
                       </td>
                      <td class="px-6 py-4">
                         <span class="px-2.5 py-1 rounded-full text-xs font-bold" 
                            [ngClass]="{
                               'bg-yellow-100 text-yellow-700': order.status === 'Pending',
                               'bg-blue-100 text-blue-700': order.status === 'Shipped',
                               'bg-green-100 text-green-700': order.status === 'Delivered',
                               'bg-red-100 text-red-700': order.status === 'Cancelled'
                            }">
                            {{ order.status }}
                         </span>
                      </td>
                      <td class="px-6 py-4 text-sm font-bold text-gray-900">₹{{ order.price }}</td>
                   </tr>
                </tbody>
             </table>
             <div *ngIf="recentOrders().length === 0" class="p-8 text-center text-gray-500">
                No orders yet.
             </div>
          </div>
       </div>
    </div>
  `
})
export class SellerDashboardComponent implements OnInit {
  private shopService = inject(ShopService);

  sellerProducts = this.shopService.sellerProducts;
  sellerOrders = this.shopService.sellerOrders;

  activeProducts = computed(() => this.sellerProducts().length);
  totalOrders = computed(() => this.sellerOrders().length);

  totalSales = computed(() => {
    return this.sellerOrders()
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, curr) => acc + curr.price, 0);
  });

  recentOrders = computed(() => this.sellerOrders().slice(0, 5));

  ngOnInit() {
    this.shopService.loadSellerProducts();
    this.shopService.loadSellerOrders();
  }
}

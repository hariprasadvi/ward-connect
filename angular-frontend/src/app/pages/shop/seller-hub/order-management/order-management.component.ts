import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../shop.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
       <div>
          <h2 class="text-2xl font-bold text-gray-900">Orders & Returns</h2>
          <p class="text-gray-500">Manage order status and view customer details.</p>
       </div>

       <!-- Orders Table -->
       <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
             <table class="w-full text-left">
                <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                   <tr>
                      <th class="px-6 py-4">Order ID</th>
                      <th class="px-6 py-4">Product</th>
                      <th class="px-6 py-4">Customer</th>
                      <th class="px-6 py-4">Address</th>
                      <th class="px-6 py-4">Status</th>
                      <th class="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                   <tr *ngFor="let order of orders()" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 text-sm text-gray-900">
                         #{{ order.id }}
                         <div class="text-xs text-gray-400">{{ order.createdAt | date:'shortDate' }}</div>
                      </td>
                      <td class="px-6 py-4">
                         <div class="flex items-center gap-3">
                            <img [src]="order.Product.image" class="w-10 h-10 rounded-lg object-cover bg-gray-100">
                            <div>
                               <div class="font-bold text-gray-900">{{ order.Product.title }}</div>
                               <div class="text-xs text-gray-500">Qty: {{ order.quantity }}</div>
                            </div>
                         </div>
                      </td>
                      <td class="px-6 py-4">
                         <div class="text-sm font-medium text-gray-900">{{ order.Order.User.full_name }}</div>
                         <div class="text-xs text-gray-500">{{ order.Order.User.mobile_number }}</div>
                      </td>
                      <td class="px-6 py-4">
                         <div class="text-sm text-gray-600 max-w-[200px] truncate" [title]="order.Order.shippingAddress">
                            {{ order.Order.shippingAddress }}
                         </div>
                      </td>
                      <td class="px-6 py-4">
                         <select [ngModel]="order.status" (ngModelChange)="updateStatus(order.id, $event)" 
                                 class="block w-full text-xs font-bold border-none rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                 [ngClass]="{
                                    'bg-yellow-100 text-yellow-700': order.status === 'Pending',
                                    'bg-blue-100 text-blue-700': order.status === 'Shipped',
                                    'bg-green-100 text-green-700': order.status === 'Delivered',
                                    'bg-red-100 text-red-700': order.status === 'Cancelled'
                                 }">
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                         </select>
                      </td>
                      <td class="px-6 py-4 text-right text-sm">
                         <!-- Placeholder for actions like Print Invoice -->
                         <button class="text-blue-600 hover:underline">Invoice</button>
                      </td>
                   </tr>
                </tbody>
             </table>
             <div *ngIf="orders().length === 0" class="p-12 text-center text-gray-500">
                No orders found.
             </div>
          </div>
       </div>
    </div>
  `
})
export class OrderManagementComponent implements OnInit {
  private shopService = inject(ShopService);
  orders = this.shopService.sellerOrders;

  ngOnInit() {
    this.shopService.loadSellerOrders();
  }

  async updateStatus(id: number, status: string) {
    try {
      await this.shopService.updateOrderItemStatus(id, status);
    } catch (e) {
      alert('Failed to update status');
    }
  }
}

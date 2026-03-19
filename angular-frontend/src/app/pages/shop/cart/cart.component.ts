import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService, CartItem } from '../shop.service';
import { UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
   selector: 'app-cart',
   standalone: true,
   imports: [CommonModule, RouterLink],
   template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <nav class="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex items-center shadow-sm">
         <button routerLink="../" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span class="font-medium">Continue Shopping</span>
         </button>
         <div class="mx-auto font-bold text-xl text-gray-900">Your Cart</div>
         <div class="w-24"></div> <!-- Spacer to center title -->
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div *ngIf="cartItems().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
           <div class="bg-blue-50 p-6 rounded-full mb-6">
              <svg class="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
           </div>
           <h2 class="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
           <p class="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
           <button routerLink="../" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Start Shopping</button>
        </div>

        <div *ngIf="cartItems().length > 0" class="flex flex-col lg:flex-row gap-8">
           
           <!-- Cart Items List -->
           <div class="flex-1 space-y-4">
              <div *ngFor="let item of cartItems()" class="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-center">
                 <!-- Image -->
                 <div class="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    <img [src]="item.image" [alt]="item.title" class="w-full h-full object-cover">
                 </div>
                 
                 <!-- Details -->
                 <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                       <div>
                          <p class="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">{{ item.category }}</p>
                          <h3 class="text-lg font-bold text-gray-900 line-clamp-1">{{ item.title }}</h3>
                       </div>
                       <button (click)="removeItem(item.id)" class="text-gray-400 hover:text-red-500 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </div>
                    
                    <div class="flex justify-between items-end mt-4">
                       <div class="flex items-center gap-4">
                          <div class="font-bold text-xl">₹{{ item.price }}</div>
                          <!-- Quantity Control -->
                          <div class="flex items-center border border-gray-200 rounded-lg">
                             <button (click)="updateQty(item.id, item.quantity - 1)" class="px-3 py-1 hover:bg-gray-50 text-gray-600">-</button>
                             <span class="px-3 py-1 font-medium border-x border-gray-200 min-w-[2rem] text-center">{{ item.quantity }}</span>
                             <button (click)="updateQty(item.id, item.quantity + 1)" class="px-3 py-1 hover:bg-gray-50 text-gray-600">+</button>
                          </div>
                       </div>
                       <div class="font-bold text-lg text-gray-900">₹{{ (item.price || 0) * item.quantity }}</div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Summary Sidebar -->
           <div class="lg:w-96 shrink-0">
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                 <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                 
                 <div class="space-y-4 mb-6">
                    <div class="flex justify-between text-gray-600">
                       <span>Subtotal ({{ cartCount() }} items)</span>
                       <span class="font-medium">₹{{ cartTotal() }}</span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                       <span>Shipping</span>
                       <span class="text-green-600 font-medium">Free</span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                       <span>Discount</span>
                       <span class="text-green-600 font-medium">- ₹0</span>
                    </div>
                 </div>

                 <div class="border-t border-gray-100 pt-4 mb-8">
                    <div class="flex justify-between text-xl font-bold text-gray-900">
                       <span>Total</span>
                       <span>₹{{ cartTotal() }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Inclusive of all taxes</p>
                 </div>

                 <button (click)="checkout()" class="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-lg shadow-gray-200">
                    Proceed to Checkout
                 </button>

                 <div class="mt-6 flex items-center justify-center gap-2 text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <span class="text-xs font-medium">Secure Transaction</span>
                 </div>
              </div>
           </div>

        </div>

      </main>
    </div>
  `
})
export class CartComponent {
   private shopService = inject(ShopService);
   private userService = inject(UserService);

   cartItems = this.shopService.cartItems;
   cartTotal = this.shopService.cartTotal;
   cartCount = this.shopService.cartCount;

   removeItem(id: number) {
      this.shopService.removeFromCart(id);
   }

   updateQty(id: number, qty: number) {
      this.shopService.updateQuantity(id, qty);
   }

   async checkout() {
      try {
         // Fetch profile to verify completion status
         const profile = await firstValueFrom(this.userService.getProfile());

         if (profile.completion < 50) {
            alert(`Your profile is only ${profile.completion}% complete. Please update your profile to at least 50% to proceed with checkout.`);
            return;
         }

         if (confirm('Place order with Cash on Delivery?')) {
            const deliveryAddress = profile.address && profile.address.trim() !== '' ? profile.address : 'Default Address Setup Needed';
            await this.shopService.checkout(deliveryAddress, 'Cash on Delivery');
            alert('Order Placed Successfully!');
         }
      } catch (e: any) {
         console.error('Checkout failed:', e);
         alert(e?.error?.message || 'Checkout failed. Please ensure you are logged in and try again.');
      }
   }
}

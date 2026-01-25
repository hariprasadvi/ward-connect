import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService } from '../shop.service';

@Component({
   selector: 'app-wishlist',
   standalone: true,
   imports: [CommonModule, RouterLink],
   template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex items-center shadow-sm">
         <button routerLink="../" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span class="font-medium">Continue Shopping</span>
         </button>
         <div class="mx-auto font-bold text-xl text-gray-900">My Wishlist</div>
         <div class="w-24"></div> 
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
         <div *ngIf="wishlistItems().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
             <div class="bg-pink-50 p-6 rounded-full mb-6">
                <svg class="w-16 h-16 text-pink-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             </div>
             <h2 class="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
             <p class="text-gray-500 mb-8">Save items you love to buy later.</p>
             <button routerLink="../" class="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">Explore Products</button>
         </div>

         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let item of wishlistItems()" 
                 class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
                 
                 <!-- Remove Button -->
                 <button (click)="remove(item.productId)" class="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-red-50 text-red-500 shadow-sm backdrop-blur-sm transition-all transform hover:scale-110">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>

                 <!-- Image -->
                 <div class="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer" [routerLink]="['../product', item.productId]">
                    <img [src]="item.productImage" [alt]="item.productTitle" class="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500">
                 </div>

                 <!-- Content -->
                 <div class="p-4 flex-1 flex flex-col">
                    <h3 class="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer" [routerLink]="['../product', item.productId]">
                       {{ item.productTitle }}
                    </h3>
                    <div class="mt-auto flex items-center justify-between pt-4">
                       <span class="text-lg font-bold text-gray-900">₹{{ item.productPrice }}</span>
                       <button class="text-blue-600 text-sm font-bold hover:underline" [routerLink]="['../product', item.productId]">View Details</button>
                    </div>
                 </div>
            </div>
         </div>
      </main>
    </div>
  `
})
export class WishlistComponent {
   private shopService = inject(ShopService);
   wishlistItems = this.shopService.wishlistItems;

   remove(productId: number) {
      this.shopService.removeFromWishlist(productId);
   }
}

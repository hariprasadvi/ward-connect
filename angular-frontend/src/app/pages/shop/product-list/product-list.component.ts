import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ShopService, Product } from '../shop.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
   selector: 'app-product-list',
   standalone: true,
   imports: [CommonModule, RouterLink, FormsModule],
   template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm backdrop-blur-md bg-opacity-80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <!-- Logo area -->
            <div class="flex items-center gap-2 cursor-pointer" routerLink="/">
               <div class="bg-blue-600 p-1.5 rounded-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
               </div>
               <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">WardShop</span>
            </div>

            <!-- Search Bar -->
            <div class="flex-1 max-w-2xl mx-4 lg:mx-8">
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearch()"
                  class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 sm:text-sm"
                  placeholder="Search for products, brands and more...">
              </div>
            </div>

             <!-- Actions -->
            <div class="flex items-center gap-4">
               <!-- Seller Hub Link (Only for Shopkeepers) -->
               <button *ngIf="isShopkeeper()" routerLink="seller-hub" class="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  Seller Panel
               </button>

               <!-- Wishlist -->
               <button routerLink="wishlist" class="relative p-2 text-gray-400 hover:text-pink-600 transition-colors group">
                  <svg class="h-6 w-6 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
               </button>

               <!-- Cart -->
               <button routerLink="cart" class="relative p-2 text-gray-400 hover:text-blue-600 transition-colors group">
                  <svg class="h-6 w-6 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span *ngIf="cartCount() > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full animate-bounce">
                    {{ cartCount() }}
                  </span>
               </button>
               
               <!-- User Profile (Mock) -->
               <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px] cursor-pointer" [title]="currentUser()?.full_name">
                  <div class="h-full w-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700">
                     {{ getInitials() }}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Promotions/Banners -->
        <div class="mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white relative">
            <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div class="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
                <div class="mb-6 md:mb-0">
                   <h2 class="text-3xl md:text-4xl font-extrabold mb-2">Support Local Ward Businesses!</h2>
                   <p class="text-blue-100 text-lg mb-6">Discover homemade food, organic produce, and handicrafts from your neighbors.</p>
                   <button class="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md">Explore Now</button>
                </div>
                <div class="hidden md:block">
                   <!-- Decorative icons or illustration could go here -->
                   <svg class="h-32 w-32 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                   </svg>
                </div>
            </div>
        </div>

        <!-- Filters & Sort (Simple Version) -->
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-800">Featured Products</h2>
            <div class="flex gap-2">
               <span class="text-sm text-gray-500 self-center">Sort by:</span>
               <select class="text-sm border-none bg-transparent font-medium text-gray-700 focus:ring-0 cursor-pointer hover:text-blue-600">
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
               </select>
            </div>
        </div>

        <!-- Product Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div *ngFor="let product of filteredProducts()" 
               class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
            
            <!-- Badges -->
            <div class="absolute top-3 left-3 z-10 flex flex-col gap-2">
               <span *ngIf="product.discount > 0" class="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {{ product.discount }}% OFF
               </span>
            </div>

            <!-- Wishlist Button -->
            <button (click)="toggleWishlist(product)" class="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm backdrop-blur-sm transition-all transform hover:scale-110"
                    [class.text-pink-500]="isLiked(product.id)" [class.text-gray-400]="!isLiked(product.id)">
               <svg class="w-5 h-5" [attr.fill]="isLiked(product.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </button>

            <!-- Image -->
            <div class="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer" [routerLink]="['product', product.id]">
               <img [src]="product.image" (error)="handleImageError($event)" [alt]="product.title" class="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500">
               <!-- Quick View Overlay (appears on hover) -->
               <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="bg-white/90 backdrop-blur text-gray-900 text-sm font-medium px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">View Details</span>
               </div>
            </div>

            <!-- Content -->
            <div class="p-4 flex-1 flex flex-col">
               <div class="mb-1 text-xs text-gray-500 font-medium uppercase tracking-wide">{{ product.category }}</div>
               <h3 class="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer" [routerLink]="['product', product.id]">
                  {{ product.title }}
               </h3>
               
               <!-- Rating -->
               <div class="flex items-center mb-3">
                  <div class="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-green-700 text-xs font-bold gap-1">
                     {{ product.rating }}
                     <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </div>
                  <span class="text-xs text-gray-400 ml-2">({{ product.reviews }} reviews)</span>
               </div>

               <div class="mt-auto flex items-center justify-between">
                  <div class="flex flex-col">
                     <span class="text-lg font-bold text-gray-900">₹{{ product.price }}</span>
                     <span class="text-xs text-gray-400 line-through">₹{{ product.originalPrice }}</span>
                  </div>
                  <button (click)="addToCart(product)" class="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </button>
               </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  `
})
export class ProductListComponent implements OnInit {
   private shopService = inject(ShopService);
   private authService = inject(AuthService);
   private router = inject(Router);

   ngOnInit() {
      if (this.isShopkeeper()) {
         this.router.navigate(['/shop/seller-hub']);
      }
   }

   searchQuery = '';
   products = this.shopService.products; // Signal
   cartCount = this.shopService.cartCount;

   filteredProducts = computed(() => {
      const q = this.shopService.searchQuery().toLowerCase();
      const allProducts = this.products(); // Read signal
      if (!q) return allProducts;
      return allProducts.filter(p =>
         p.title.toLowerCase().includes(q) ||
         p.category.toLowerCase().includes(q)
      );
   });

   currentUser = signal<any>(this.authService.getCurrentUser());

   isShopkeeper() {
      return this.authService.hasRole('Shopkeeper');
   }

   getInitials() {
      const name = this.currentUser()?.full_name || 'User';
      return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
   }

   onSearch() {
      this.shopService.setSearchQuery(this.searchQuery);
   }

   addToCart(product: Product) {
      this.shopService.addToCart(product);
      alert('Item added to cart!');
   }

   toggleWishlist(product: Product) {
      this.shopService.toggleWishlist(product);
   }

   isLiked(id: number) {
      return this.shopService.wishlistItems().some(i => i.productId === id);
   }

   handleImageError(event: any) {
      event.target.src = 'https://placehold.co/600x400?text=No+Image';
   }
}

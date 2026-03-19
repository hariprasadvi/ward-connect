import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShopService, Product } from '../shop.service';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

declare var Razorpay: any;

@Component({
   selector: 'app-product-detail',
   standalone: true,
   imports: [CommonModule, RouterLink, FormsModule],
   template: `
    <div class="min-h-screen bg-white">
      <!-- Simple Header -->
      <nav class="border-b border-gray-100 py-4 px-6 flex items-center gap-4">
         <button routerLink="../" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
         </button>
         <h1 class="text-xl font-bold text-gray-900">Product Details</h1>
         <div class="ml-auto flex gap-4">
             <button routerLink="../wishlist" class="relative p-2 text-gray-400 hover:text-pink-600 transition-colors">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
             </button>
             <button routerLink="../cart" class="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span *ngIf="cartCount() > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {{ cartCount() }}
                  </span>
             </button>
         </div>
      </nav>

      <div *ngIf="product() as product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
           
           <!-- Image Gallery Section -->
           <div class="space-y-4">
              <div class="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-xl border border-gray-100 relative group">
                  <img [src]="product.image" [alt]="product.title" class="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700">
                  <button (click)="toggleWishlist()" class="absolute top-4 right-4 p-3 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow-sm transition-all transform hover:scale-110" [class.text-pink-500]="isLiked()" [class.text-gray-400]="!isLiked()">
                     <svg class="w-6 h-6" [attr.fill]="isLiked() ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>
              </div>
           </div>

           <!-- Details Section -->
           <div class="flex flex-col">
              <div class="mb-2">
                 <span class="text-sm font-bold text-blue-600 uppercase tracking-wide bg-blue-50 px-3 py-1 rounded-full">{{ product.category }}</span>
              </div>
              <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{{ product.title }}</h1>
              
              <!-- Rating -->
              <div class="flex items-center gap-4 mb-6">
                 <div class="flex items-center bg-green-100 px-2 py-1 rounded-lg text-green-800 font-bold">
                    {{ product.rating }} <span class="text-lg ml-1">★</span>
                 </div>
                 <span class="text-gray-500 font-medium">{{ product.reviews }} ratings & reviews</span>
              </div>

              <!-- Price -->
              <div class="flex items-baseline gap-4 mb-8">
                 <span class="text-4xl font-bold text-gray-900">₹{{ product.price }}</span>
                 <span class="text-xl text-gray-400 line-through">₹{{ product.originalPrice }}</span>
                 <span class="text-lg font-bold text-green-600">{{ product.discount }}% off</span>
              </div>

              <!-- Description -->
              <div class="prose prose-lg text-gray-600 mb-8">
                 <p>{{ product.description }}</p>
                 <ul class="list-disc pl-5 space-y-2 mt-4 text-base">
                    <li>High quality materials and craftsmanship</li>
                    <li>1 Year Standard Manufacturer Warranty</li>
                    <li>7 Days Return Policy</li>
                 </ul>
              </div>

              <!-- Actions -->
              <div class="mt-auto flex gap-4">
                 <button (click)="addToCart()" class="flex-1 bg-gray-900 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-lg shadow-gray-200 flex items-center justify-center gap-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Add to Cart
                 </button>
                 <button (click)="buyNow()" class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all transform hover:-translate-y-1">
                    Buy Now
                 </button>
              </div>

              <!-- Check Pincode -->
              <div class="mt-8 pt-8 border-t border-gray-100">
                 <div class="flex items-center gap-2 mb-2">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span class="font-medium text-gray-700">Check Pincode</span>
                 </div>
                 <div class="flex gap-2">
                    <input type="text" [(ngModel)]="pincode" placeholder="Enter Pincode" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-40">
                    <button (click)="checkPincode()" class="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">Check</button>
                 </div>
                 
                 <!-- Availability Notification -->
                 <div *ngIf="availabilityStatus" class="mt-3 flex items-center gap-2 text-sm font-medium animate-fade-in-up" [class.text-green-600]="availabilityStatus === 'Available'" [class.text-red-500]="availabilityStatus !== 'Available'">
                    <svg *ngIf="availabilityStatus === 'Available'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <svg *ngIf="availabilityStatus !== 'Available'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    <span>{{ availabilityMessage }}</span>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
   private route = inject(ActivatedRoute);
   private shopService = inject(ShopService);

   productId = signal<number>(0);

   product = computed(() => {
      const id = this.productId();
      if (!id) return undefined;
      return this.shopService.getProductById(id)();
   });

   cartCount = this.shopService.cartCount;

   pincode = '';
   availabilityStatus: 'Available' | 'Unavailable' | null = null;
   availabilityMessage = '';

   isLiked = computed(() => {
      const p = this.product();
      return p ? this.shopService.isInWishlist(p.id)() : false;
   });

   ngOnInit() {
      this.route.params.subscribe(params => {
         const id = +params['id'];
         this.productId.set(id);
      });
   }

   addToCart() {
      const p = this.product();
      if (p) {
         this.shopService.addToCart(p);
         alert('Item added to cart!');
      }
   }

   toggleWishlist() {
      const p = this.product();
      if (p) {
         this.shopService.toggleWishlist(p);
      }
   }

   checkPincode() {
      if (!this.pincode) return;

      const p = this.product();
      if (!p) return;

      if (!p.unavailablePincodes) {
         // If no restriction is set, assume available everywhere (or implement specific whitelist logic if needed)
         this.availabilityStatus = 'Available';
         this.availabilityMessage = `Delivery available at ${this.pincode}`;
         return;
      }

      const blockedPincodes = p.unavailablePincodes.split(',').map((code: string) => code.trim());

      if (blockedPincodes.includes(this.pincode)) {
         this.availabilityStatus = 'Unavailable';
         this.availabilityMessage = `Not available at ${this.pincode}`;
      } else {
         this.availabilityStatus = 'Available';
         this.availabilityMessage = `Delivery available at ${this.pincode}`;
      }
   }

   private userService = inject(UserService);

   async buyNow() {
      const p = this.product();
      if (!p) return;

      try {
         // Profile check
         const profile = await firstValueFrom(this.userService.getProfile());
         if (profile.completion < 50) {
            alert(`Your profile is only ${profile.completion}% complete. Please update your profile to at least 50% to proceed with purchasing.`);
            return;
         }

         const amount = Number(p.price);
         const orderData = await this.shopService.createRazorpayOrder(amount);

         const options = {
            key: 'rzp_test_S3iNfkYOx5zNOb',
            amount: orderData.amount,
            currency: 'INR',
            name: 'Ward Connect Shop',
            description: p.title,
            image: p.image || 'https://via.placeholder.com/150',
            order_id: orderData.id,
            handler: async (response: any) => {
               try {
                  await this.shopService.addToCart(p);
                  const deliveryAddress = profile.address && profile.address.trim() !== '' ? profile.address : 'Default Address';
                  await this.shopService.checkout(deliveryAddress, 'Prepaid - Razorpay');

                  alert('Payment successful & Order placed! Payment ID: ' + response.razorpay_payment_id);
               } catch (err: any) {
                  console.error('Order saving failed', err);
                  alert('Payment was successful but internal order creation failed.');
               }
            },
            prefill: {
               name: profile.full_name || 'Customer User',
               email: profile.email || 'customer@example.com',
               contact: profile.mobile_number || '9000090000'
            },
            theme: {
               color: '#4f46e5'
            }
         };

         const rzp = new Razorpay(options);
         rzp.on('payment.failed', function (response: any) {
            alert('Payment failed: ' + response.error.description);
         });
         rzp.open();

      } catch (err: any) {
         console.error('Buy Now Error:', err);
         const errorMsg = err?.error?.message || 'Failed to initiate payment. Ensure your details are complete and you are logged in.';
         alert(errorMsg);
      }
   }
}

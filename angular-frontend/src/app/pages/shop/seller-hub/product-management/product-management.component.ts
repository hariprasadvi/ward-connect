import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService, Product } from '../../shop.service';

@Component({
   selector: 'app-product-management',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="space-y-6">
       <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">My Products</h2>
          <button (click)="openEditor()" class="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
             Add Product
          </button>
       </div>

       <!-- Editor Form (Conditional) -->
       <div *ngIf="showEditor()" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-fade-in-down">
          <h3 class="text-lg font-bold mb-4">{{ editingId() ? 'Edit Product' : 'New Product' }}</h3>
          <form (ngSubmit)="saveProduct()" class="space-y-4">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                   <input [(ngModel)]="form.title" name="title" required class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none">
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                   <select [(ngModel)]="form.category" name="category" required class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none bg-white">
                      <option value="Homemade Food">Homemade Food</option>
                      <option value="Bakery & Snacks">Bakery & Snacks</option>
                      <option value="Handicrafts">Handicrafts</option>
                      <option value="Organic Produce">Organic Produce</option>
                      <option value="Household Essentials">Household Essentials</option>
                      <option value="Tailoring & Fashion">Tailoring & Fashion</option>
                      <option value="Plants & Gardening">Plants & Gardening</option>
                   </select>
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                   <input type="number" [(ngModel)]="form.price" name="price" required class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none">
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                   <input type="number" [(ngModel)]="form.originalPrice" name="originalPrice" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none">
                </div>
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div class="space-y-2">
                   <input [(ngModel)]="form.image" name="image" placeholder="Image URL (optional)" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none">
                   <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-gray-500 uppercase">OR</span>
                      <input type="file" (change)="onFileSelected($event)" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                   </div>
                </div>
                <div *ngIf="imagePreview" class="mt-2">
                   <img [src]="imagePreview" class="h-20 w-20 object-cover rounded-lg border border-gray-200">
                </div>
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea [(ngModel)]="form.description" name="description" rows="3" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"></textarea>
             </div>

             <!-- Pincode Exclusion -->
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Unavailable Delivery Pincodes (Method: Enter comma separated list)</label>
                <input [(ngModel)]="form.unavailablePincodes" name="unavailablePincodes" placeholder="e.g. 682001, 682002" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none">
                <p class="text-xs text-gray-500 mt-1">Users from these pincodes will see "Unavailable".</p>
             </div>
             
             <div class="flex justify-end gap-3 pt-4">
                <button type="button" (click)="closeEditor()" class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">Cancel</button>
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm disabled:opacity-50">
                   Save Product
                </button>
             </div>
          </form>
       </div>

       <!-- Products Table -->
       <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
             <table class="w-full text-left">
                <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                   <tr>
                      <th class="px-6 py-4">Product</th>
                      <th class="px-6 py-4">Price</th>
                      <th class="px-6 py-4">Category</th>
                      <th class="px-6 py-4">Discount</th>
                      <th class="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                   <tr *ngFor="let product of products()" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4">
                         <div class="flex items-center gap-3">
                            <img [src]="product.image" (error)="handleImageError($event)" class="w-12 h-12 rounded-lg object-cover bg-gray-100">
                            <div>
                               <div class="font-bold text-gray-900">{{ product.title }}</div>
                               <div class="text-xs text-gray-500 truncate max-w-[200px]">{{ product.description }}</div>
                            </div>
                         </div>
                      </td>
                      <td class="px-6 py-4 font-medium text-gray-900">₹{{ product.price }}</td>
                      <td class="px-6 py-4">
                         <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{{ product.category }}</span>
                      </td>
                      <td class="px-6 py-4 text-green-600 font-bold">{{ product.discount }}%</td>
                      <td class="px-6 py-4 text-right">
                         <div class="flex items-center justify-end gap-2">
                            <button (click)="editProduct(product)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                            <button (click)="deleteProduct(product.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                         </div>
                      </td>
                   </tr>
                </tbody>
             </table>
             <div *ngIf="products().length === 0" class="p-12 text-center text-gray-500">
                You haven't added any products yet.
             </div>
          </div>
       </div>
    </div>
  `
})
export class ProductManagementComponent implements OnInit {
   private shopService = inject(ShopService);
   products = this.shopService.sellerProducts;

   showEditor = signal(false);
   editingId = signal<number | null>(null);
   selectedFile: File | null = null;
   imagePreview: string | null = null;

   form: any = {
      title: '',
      price: 0,
      originalPrice: 0,
      category: 'Homemade Food',
      image: '',
      description: '',
      discount: 0,
      unavailablePincodes: ''
   };

   ngOnInit() {
      this.shopService.loadSellerProducts();
   }

   openEditor() {
      this.resetForm();
      this.showEditor.set(true);
   }

   closeEditor() {
      this.showEditor.set(false);
      this.resetForm();
   }

   resetForm() {
      this.form = {
         title: '',
         price: 0,
         originalPrice: 0,
         category: 'Homemade Food',
         image: '',
         description: '',
         discount: 0,
         unavailablePincodes: ''
      };
      this.editingId.set(null);
      this.selectedFile = null;
      this.imagePreview = null;
   }

   onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
         this.selectedFile = file;
         const reader = new FileReader();
         reader.onload = () => {
            this.imagePreview = reader.result as string;
         };
         reader.readAsDataURL(file);
      }
   }

   editProduct(product: Product) {
      this.form = { ...product };
      this.editingId.set(product.id);
      this.showEditor.set(true);
   }

   async saveProduct() {
      try {
         // Calculate discount
         if (this.form.originalPrice > this.form.price) {
            this.form.discount = Math.round(((this.form.originalPrice - this.form.price) / this.form.originalPrice) * 100);
         } else {
            this.form.discount = 0;
         }

         const formData = new FormData();
         // Append all form fields
         Object.keys(this.form).forEach(key => {
            // Handle null/undefined
            if (this.form[key] !== null && this.form[key] !== undefined) {
               formData.append(key, this.form[key]);
            }
         });

         const file = this.selectedFile;
         if (file) {
            formData.append('image', file);
         }

         const editId = this.editingId();
         if (editId) {
            await this.shopService.updateProduct(editId, formData);
         } else {
            await this.shopService.createProduct(formData);
         }
         this.closeEditor();
      } catch (e) {
         console.error(e);
         alert('Failed to save product');
      }
   }

   async deleteProduct(id: number) {
      if (confirm('Are you sure you want to delete this product?')) {
         try {
            await this.shopService.deleteProduct(id);
         } catch (e) {
            alert('Failed to delete product');
         }
      }
   }

   handleImageError(event: any) {
      if (event && event.target) {
         (event.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Img';
      }
   }
}

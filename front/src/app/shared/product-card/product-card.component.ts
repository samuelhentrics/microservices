import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <a [routerLink]="['/products', product?.id]" class="block">
        <img [src]="product?.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=60'" [alt]="product?.name" class="w-full h-44 object-cover hover:opacity-90" />
      </a>
      <div class="p-4 flex-1 flex flex-col">
        <h3 class="font-semibold text-lg mb-1">
          <a [routerLink]="['/products', product?.id]" class="hover:underline">{{product?.name}}</a>
        </h3>
        <p class="text-sm text-gray-600 mb-3">{{product?.category}} · {{product?.description}}</p>
        <div class="mt-auto flex items-center justify-between">
          <div class="text-red-600 font-bold">{{product?.price}} €</div>
          <div class="flex items-center gap-2">
            <button (click)="addToCart()" aria-label="Ajouter au panier" class="p-2 bg-red-600 text-white rounded flex items-center justify-center hover:bg-red-700">
              <i class="fa-solid fa-cart-shopping"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product | null;
  @Output() view = new EventEmitter<string>();
  @Output() add = new EventEmitter<string>();

  viewProduct(): void {
    if (this.product) {
      this.view.emit(this.product.id);
    }
  }

  addToCart(): void {
    if (this.product) {
      this.add.emit(this.product.id);
    }
  }
}

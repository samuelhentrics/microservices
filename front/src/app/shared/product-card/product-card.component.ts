import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, firstValueFrom } from 'rxjs';

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
            <!-- If quantity is zero show add button -->
            <button *ngIf="quantity === 0" (click)="handleAdd()" aria-label="Ajouter au panier" class="p-2 bg-red-600 text-white rounded flex items-center justify-center hover:bg-red-700">
              <i class="fa-solid fa-cart-shopping"></i>
            </button>

            <!-- If already in cart show decrement / quantity / increment -->
            <div *ngIf="quantity > 0" class="flex items-center gap-2">
              <button (click)="decrement()" class="px-2 py-1 bg-gray-200 rounded">-</button>
              <div class="px-3">{{ quantity }}</div>
              <button (click)="increment()" class="px-2 py-1 bg-gray-200 rounded">+</button>
            </div>
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

  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private subs: Subscription[] = [];

  quantity = 0;
  productItemIds: string[] = [];

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

  // New handlers using CartService
  ngOnInit() {
    this.refreshLocalCartState();
    const s = this.cartService.cartUpdated$.subscribe(() => this.refreshLocalCartState());
    this.subs.push(s);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private async refreshLocalCartState() {
    const user = this.auth.currentUserValue;
    if (!user || !this.product) {
      this.quantity = 0;
      this.productItemIds = [];
      return;
    }
    try {
      const res = await this.cartService.fetchCartOnce(user.id);
      const items = res.items || [];
      const myItems = items.filter(i => i.product_id === this.product!.id);
      this.productItemIds = myItems.map(i => i.id);
      // sum quantities (in case server stores multiple rows per product)
      this.quantity = myItems.reduce((s, it) => s + (it.quantity || 0), 0);
    } catch (e) {
      this.quantity = 0;
      this.productItemIds = [];
    }
  }

  async handleAdd() {
    const user = this.auth.currentUserValue;
    if (!user || !this.product) return;
    if (!this.cartService) return;
    try {
      // ensure cart exists
      const cartRes = await this.cartService.fetchCartOnce(user.id);
      let cartId = cartRes.cart?.id;
      if (!cartId) {
          // createCart returns an Observable; await it
          const created = await firstValueFrom(this.cartService.createCart(user.id));
          if (created && (created as any).id) cartId = (created as any).id;
          else {
            const newCart = await this.cartService.fetchCartOnce(user.id);
            cartId = newCart.cart?.id;
          }
      }
      if (!cartId) return;
      await firstValueFrom(this.cartService.addItem(cartId, this.product.id));
      // cartService will emit cartUpdated$, refreshLocalCartState will be triggered
    } catch (e) {
      console.error(e);
    }
  }

  async increment() {
    // same as add
    await this.handleAdd();
  }

  async decrement() {
    if (!this.product || this.productItemIds.length === 0 || !this.auth.currentUserValue) return;
    const cartId = this.cartService ? (await this.cartService.fetchCartOnce(this.auth.currentUserValue.id)).cart?.id : null;
    if (!cartId) return;
    const itemId = this.productItemIds[this.productItemIds.length - 1];
    try {
      await firstValueFrom(this.cartService.removeItem(cartId, itemId));
      // cartUpdated$ will trigger refresh
    } catch (e) {
      console.error(e);
    }
  }
}

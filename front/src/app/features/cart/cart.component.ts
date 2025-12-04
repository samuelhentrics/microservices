import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Cart, CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class CartComponent {
  private auth = inject(AuthService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private subs: Subscription[] = [];

  public cart: Cart | null = null;
  public items: CartItem[] = [];
  // enriched items with product details for display
  // itemId is a representative cart_item id (used for remove/decrement operations)
  public displayItems: Array<{ itemId: string; product: Product; quantity: number; }> = [];
  public loading = false;
  public message = '';
  // VAT rate for food (5.5%) — prices already include VAT
  private readonly VAT_RATE = 0.055;

  async loadCart() {
    const user = this.auth.currentUserValue;
    if (!user) {
      this.message = 'Connecte-toi pour voir ton panier.';
      return;
    }
    this.loading = true;
    try {
      const res = await firstValueFrom(this.cartService.getCart(user.id));
      this.cart = res.cart;
      this.items = res.items || [];
      await this.buildDisplayItems();
    } catch (e) {
      console.error(e);
      this.message = 'Erreur lors du chargement du panier.';
    } finally {
      this.loading = false;
    }
  }

  async createCart() {
    const user = this.auth.currentUserValue;
    if (!user) {
      this.message = 'Connecte-toi pour créer un panier.';
      return;
    }
    try {
      const res = await firstValueFrom(this.cartService.createCart(user.id));
      this.cart = res;
      this.items = [];
      this.displayItems = [];
      this.message = 'Panier créé.';
    } catch (e) {
      console.error(e);
      this.message = 'Impossible de créer le panier.';
    }
  }

  async addItem(productId: string) {
    if (!this.cart) {
      this.message = "Crée d'abord un panier.";
      return;
    }
    try {
      const res = await firstValueFrom(this.cartService.addItem(this.cart.id, productId, 1));
      this.items.push(res);
      await this.buildDisplayItems();
    } catch (e) {
      console.error(e);
      this.message = 'Impossible d\'ajouter l\'article.';
    }
  }

  // wrapper used by template: increment quantity for product
  async incrementItem(productId: string) {
    // ensure cart exists
    const user = this.auth.currentUserValue;
    if (!user) {
      this.message = 'Connecte-toi pour ajouter au panier.';
      return;
    }
    if (!this.cart) {
      // try to fetch or create
      const res = await firstValueFrom(this.cartService.getCart(user.id));
      if (!res.cart) {
        const created = await firstValueFrom(this.cartService.createCart(user.id));
        this.cart = created;
      } else {
        this.cart = res.cart;
      }
    }
    if (!this.cart) return;
    try {
      await firstValueFrom(this.cartService.addItem(this.cart.id, productId, 1));
      // refresh
      const latest = await firstValueFrom(this.cartService.getCart(user.id));
      this.items = latest.items || [];
      await this.buildDisplayItems();
    } catch (e) {
      console.error(e);
    }
  }

  async removeItem(itemId: string) {
    if (!this.cart) return;
    try {
      await firstValueFrom(this.cartService.removeItem(this.cart.id, itemId));
      this.items = this.items.filter(i => i.id !== itemId);
      await this.buildDisplayItems();
    } catch (e) {
      console.error(e);
      this.message = 'Impossible de supprimer l\'article.';
    }
  }

  // wrapper for decrementing: remove a single item by its cart_item id
  async decrementItem(itemId: string) {
    await this.removeItem(itemId);
  }

  private async buildDisplayItems() {
    this.displayItems = [];
    if (!this.items || this.items.length === 0) return;
    // Group items by product_id so the UI shows a single line per product with summed quantity
    const grouped: { [productId: string]: { quantity: number; representativeId: string } } = {};
    for (const it of this.items) {
      const pid = it.product_id;
      if (!grouped[pid]) grouped[pid] = { quantity: 0, representativeId: it.id };
      grouped[pid].quantity += (it.quantity || 0);
      // keep the first id as representative (used for remove/decrement)
    }
    // Fetch product details for each unique product and build displayItems
    try {
      const entries = await Promise.all(Object.keys(grouped).map(async (pid) => {
        try {
          const p = await firstValueFrom(this.productService.getProductById(pid));
          return { itemId: grouped[pid].representativeId, product: p, quantity: grouped[pid].quantity };
        } catch (e) {
          return { itemId: grouped[pid].representativeId, product: { id: pid, name: 'Produit', price: 0, category: '', image: '' } as Product, quantity: grouped[pid].quantity };
        }
      }));
      this.displayItems = entries;
    } catch (e) {
      console.error('buildDisplayItems failed', e);
    }
  }

  // compute subtotal
  get subtotal(): number {
    return this.displayItems.reduce((s, it) => s + (it.product?.price || 0) * (it.quantity || 0), 0);
  }

  get vat(): number {
    // Prices already include VAT. Compute the VAT portion included in the subtotal:
    // VAT portion = subtotal * (rate / (1 + rate))
    return +(this.subtotal * (this.VAT_RATE / (1 + this.VAT_RATE))).toFixed(2);
  }

  get shipping(): number {
    return this.subtotal > 50 ? 0 : 5;
  }

  get total(): number {
    // Total = subtotal (which already includes VAT) + shipping
    return +(this.subtotal + this.shipping).toFixed(2);
  }

  ngOnInit() {
    // Subscribe first so selected cart (BehaviorSubject) takes precedence.
    let initialHandled = false;
    const s = this.cartService.selectedCart$.subscribe(async (cartId) => {
      try {
        initialHandled = true;
        // handle case where selection is cleared
        if (!cartId) {
          this.cart = null;
          this.items = [];
          this.displayItems = [];
          return;
        }
        // load the selected cart by id
        const res: any = await firstValueFrom(this.cartService.getCartById(cartId));
        this.cart = res.cart || null;
        this.items = res.items || [];
        await this.buildDisplayItems();
      } catch (e) {
        console.error('Failed to load selected cart', e);
      }
    });
    this.subs.push(s);

    // If no selected cart was emitted synchronously, load the user's default cart
    if (!initialHandled) {
      this.loadCart();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}

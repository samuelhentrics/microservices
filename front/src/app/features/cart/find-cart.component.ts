import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-find-cart',
  templateUrl: './find-cart.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FindCartComponent {
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  public auth = inject(AuthService);
  private subs: any[] = [];
  private router = inject(Router);

  public queryUserId = '';
  public loading = false;
  public message = '';
  public cart: any = null;
  public carts: any[] = [];
  public displayItems: Array<{ product: Product; quantity: number; representativeId: string }> = [];

  reset() {
    this.queryUserId = '';
    this.cart = null;
    this.displayItems = [];
    this.message = '';
  }

  async findByUser() {
    this.message = '';
    // if no explicit user id, try current logged-in user
    if (!this.queryUserId) {
      const user = this.auth.currentUserValue;
      if (user && user.id) {
        this.queryUserId = user.id;
      }
    }
    if (!this.queryUserId) {
      this.message = 'Saisis un user id ou connecte-toi pour voir tes paniers.';
      return;
    }
    this.loading = true;
    this.cart = null;
    this.displayItems = [];
    this.carts = [];
    try {
      // List carts for the provided user id
      const listRes: any = await firstValueFrom(this.cartService.listCarts(this.queryUserId));
      this.carts = listRes?.carts || [];
      if (!this.carts || this.carts.length === 0) {
        this.message = 'Aucun panier trouvé pour cet utilisateur.';
        return;
      }
      // do not auto-load any cart — just show the list and let the user click 'Charger'
    } catch (e) {
      console.error(e);
      this.message = 'Erreur lors de la récupération des paniers.';
    } finally {
      this.loading = false;
    }
  }

  // load carts for current logged-in user
  async findMyCarts() {
    const user = this.auth.currentUserValue;
    if (!user || !user.id) {
      this.message = 'Tu dois être connecté pour voir tes paniers.';
      return;
    }
    this.queryUserId = user.id;
    await this.findByUser();
  }

  ngOnInit() {
    // If the current user is already available, load their carts.
    const user = this.auth.currentUserValue;
    if (user && user.id) {
      this.queryUserId = user.id;
      this.findByUser().catch(() => {});
    }
    // Also subscribe to future auth changes (in case auth loads after component init)
    const s = this.auth.currentUser$.subscribe(u => {
      if (u && u.id) {
        this.queryUserId = u.id;
        this.findByUser().catch(() => {});
      } else {
        // clear when logged out
        this.carts = [];
        this.cart = null;
        this.displayItems = [];
      }
    });
    this.subs.push(s);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe?.());
  }

  // Load a specific cart by id and build displayItems
  async loadCart(cartId: string) {
    this.loading = true;
    this.message = '';
    this.displayItems = [];
    try {
      const res: any = await firstValueFrom(this.cartService.getCartById(cartId));
      if (!res || !res.cart) {
        this.message = 'Panier introuvable.';
        return;
      }
      this.cart = res.cart;
      const items = res.items || [];
      const grouped: { [pid: string]: { qty: number; repId: string } } = {};
      for (const it of items) {
        if (!grouped[it.product_id]) grouped[it.product_id] = { qty: 0, repId: it.id };
        grouped[it.product_id].qty += (it.quantity || 0);
      }
      const entries = await Promise.all(Object.keys(grouped).map(async (pid) => {
        try {
          const p = await firstValueFrom(this.productService.getProductById(pid));
          return { product: p, quantity: grouped[pid].qty, representativeId: grouped[pid].repId };
        } catch (e) {
          return { product: { id: pid, name: 'Produit', price: 0, category: '', image: '' } as Product, quantity: grouped[pid].qty, representativeId: grouped[pid].repId };
        }
      }));
      this.displayItems = entries;
      // notify other components that this cart should be selected as current
      this.cartService.selectCart(cartId);
      // navigate to the main cart page so the user sees the active cart
      try { this.router.navigate(['/cart']); } catch (e) {}
    } catch (e) {
      console.error(e);
      this.message = 'Erreur lors du chargement du panier.';
    } finally {
      this.loading = false;
    }
  }

  async deleteCart(cartId: string) {
    const ok = confirm('Supprimer ce panier et tous ses articles ?');
    if (!ok) return;
    try {
      await firstValueFrom(this.cartService.deleteCart(cartId));
      // refresh list
      const listRes: any = await firstValueFrom(this.cartService.listCarts(this.queryUserId));
      this.carts = listRes?.carts || [];
      if (this.cart && this.cart.id === cartId) {
        this.cart = null;
        this.displayItems = [];
      }
    } catch (e) {
      console.error(e);
      this.message = 'Impossible de supprimer le panier.';
    }
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-find-cart',
  templateUrl: './find-cart.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FindCartComponent {
  private cartService = inject(CartService);
  private productService = inject(ProductService);

  public queryUserId = '';
  public loading = false;
  public message = '';
  public cart: any = null;
  public displayItems: Array<{ product: Product; quantity: number; representativeId: string }> = [];

  reset() {
    this.queryUserId = '';
    this.cart = null;
    this.displayItems = [];
    this.message = '';
  }

  async findByUser() {
    this.message = '';
    if (!this.queryUserId) {
      this.message = 'Saisis un user id.';
      return;
    }
    this.loading = true;
    this.cart = null;
    this.displayItems = [];
    try {
      const res: any = await firstValueFrom(this.cartService.getCart(this.queryUserId));
      if (!res || !res.cart) {
        this.message = 'Aucun panier trouvé pour cet utilisateur.';
        return;
      }
      this.cart = res.cart;
      const items = res.items || [];
      // group by product_id
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
    } catch (e) {
      console.error(e);
      this.message = 'Erreur lors de la récupération du panier.';
    } finally {
      this.loading = false;
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, CartWithItems } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/carts`;
  // Emits whenever cart content likely changed (create/add/remove)
  private cartUpdatedSubject = new Subject<void>();
  public cartUpdated$ = this.cartUpdatedSubject.asObservable();

  createCart(userId: string): Observable<Cart> {
    return this.http.post<Cart>(this.base, { user_id: userId }).pipe(
      tap(() => this.cartUpdatedSubject.next())
    );
  }

  getCart(userId: string): Observable<CartWithItems> {
    return this.http.get<CartWithItems>(this.base, { params: { user_id: userId } });
  }

  addItem(cartId: string, productId: string, quantity = 1, metadata?: any): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.base}/${cartId}/items`, { product_id: productId, quantity, metadata }).pipe(
      tap(() => this.cartUpdatedSubject.next())
    );
  }

  removeItem(cartId: string, itemId: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${cartId}/items/${itemId}`).pipe(
      tap(() => this.cartUpdatedSubject.next())
    );
  }

  // Convenience: fetch current cart once
  async fetchCartOnce(userId: string): Promise<CartWithItems> {
    return firstValueFrom(this.getCart(userId));
  }
}

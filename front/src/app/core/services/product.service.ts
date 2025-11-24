import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from '../../shared/product-card/product-card.component';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  constructor() {}

  getProducts(): Observable<Product[]> {
    return this.http.get<{ products: any[] }>(this.base).pipe(
      map(res => res.products.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        category: p.category || p.type,
        image: p.image || p.image_url,
        description: p.description || '',
      })))
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<{ product: any }>(`${this.base}/${id}`).pipe(
      map(r => {
        const p = r.product;
        return {
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category: p.category || p.type,
          image: p.image || p.image_url,
          description: p.description || '',
        } as Product;
      })
    );
  }
}

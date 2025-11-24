import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductCardComponent, Product } from '../../shared/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './products.component.html'
})
export class ProductsComponent {
  q = '';
  category = '';
  maxPrice: number | null = null;

  products: Product[] = [];

  constructor(private router: Router, private productService: ProductService) {
    this.products = this.productService.getProducts();
  }

  get categories(): string[] {
    const set = new Set(this.products.map(p => p.category));
    return Array.from(set);
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      if (this.q) {
        const q = this.q.toLowerCase();
        if (!(p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))) return false;
      }
      if (this.category && p.category !== this.category) return false;
      if (this.maxPrice !== null && this.maxPrice !== undefined && p.price > Number(this.maxPrice)) return false;
      return true;
    });
  }

  viewProduct(id: number) {
    this.router.navigate(['/products', id]);
  }

  resetFilters() {
    this.q = '';
    this.category = '';
    this.maxPrice = null;
  }
}

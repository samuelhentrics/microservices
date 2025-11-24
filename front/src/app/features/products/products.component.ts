import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductCardComponent, Product } from '../../shared/product-card/product-card.component';

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

  // sample products for front-end only
  products: Product[] = [
    { id: 1, name: 'Fromage de chèvre', price: 6.5, category: 'Fromages', image: '', description: 'Fromage frais et crémeux' },
    { id: 2, name: 'Saucisson sec', price: 8, category: 'Charcuterie', image: '', description: 'Saucisson artisanal' },
    { id: 3, name: 'Pâté de campagne', price: 5, category: 'Charcuterie', image: '', description: 'Pâté traditionnel' },
    { id: 4, name: 'Jambon cru', price: 12, category: 'Charcuterie', image: '', description: 'Jambon affiné' },
    { id: 5, name: 'Comté 24 mois', price: 14, category: 'Fromages', image: '', description: 'Affiné et fruité' },
    { id: 6, name: 'Confiture artisanale', price: 4, category: 'Conserves', image: '', description: 'Goût local' }
  ];

  constructor(private router: Router) {}

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

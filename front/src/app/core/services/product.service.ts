import { Injectable } from '@angular/core';
import { Product } from '../../shared/product-card/product-card.component';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'Fromage de chèvre', price: 6.5, category: 'Fromages', image: '', description: 'Fromage frais et crémeux' },
    { id: 2, name: 'Saucisson sec', price: 8, category: 'Charcuterie', image: '', description: 'Saucisson artisanal' },
    { id: 3, name: 'Pâté de campagne', price: 5, category: 'Charcuterie', image: '', description: 'Pâté traditionnel' },
    { id: 4, name: 'Jambon cru', price: 12, category: 'Charcuterie', image: '', description: 'Jambon affiné' },
    { id: 5, name: 'Comté 24 mois', price: 14, category: 'Fromages', image: '', description: 'Affiné et fruité' },
    { id: 6, name: 'Confiture artisanale', price: 4, category: 'Conserves', image: '', description: 'Goût local' }
  ];

  constructor() {}

  getProducts(): Product[] {
    // return a shallow copy to avoid accidental mutation
    return [...this.products];
  }

  getProductById(id: number): Product | null {
    return this.products.find(p => p.id === id) || null;
  }
}

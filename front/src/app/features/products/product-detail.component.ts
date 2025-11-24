import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent {
  product: Product | null = null;

  // same sample dataset as ProductsComponent, used for frontend only
  products: Product[] = [
    { id: 1, name: 'Fromage de chèvre', price: 6.5, category: 'Fromages', image: '', description: 'Fromage frais et crémeux' },
    { id: 2, name: 'Saucisson sec', price: 8, category: 'Charcuterie', image: '', description: 'Saucisson artisanal' },
    { id: 3, name: 'Pâté de campagne', price: 5, category: 'Charcuterie', image: '', description: 'Pâté traditionnel' },
    { id: 4, name: 'Jambon cru', price: 12, category: 'Charcuterie', image: '', description: 'Jambon affiné' },
    { id: 5, name: 'Comté 24 mois', price: 14, category: 'Fromages', image: '', description: 'Affiné et fruité' },
    { id: 6, name: 'Confiture artisanale', price: 4, category: 'Conserves', image: '', description: 'Goût local' }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = idStr ? Number(idStr) : NaN;
    if (!isNaN(id)) {
      this.product = this.products.find(p => p.id === id) || null;
    }
  }

  back() {
    this.router.navigate(['/products']);
  }

  addToCart() {
    // placeholder: integrate with cart service later
    alert('Ajouté au panier (simulation)');
  }
}

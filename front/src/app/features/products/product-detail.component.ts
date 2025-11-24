import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../shared/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent {
  product: Product | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private productService: ProductService) {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = idStr ? Number(idStr) : NaN;
    if (!isNaN(id)) {
      this.product = this.productService.getProductById(id);
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../core/models/product.model';
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(id).subscribe(p => this.product = p, () => this.product = null);
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

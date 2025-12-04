import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private productService = inject(ProductService);

  products: Product[] = [];

  isAuthenticated = () => this.auth.isAuthenticated();

  year = new Date().getFullYear();

  viewProduct(id: string): void {
    // navigate to a product details route if available
    this.router.navigate(['/products', id]);
  }

  constructor() {
    // fetch 3 random featured products
    this.productService.getRandomProducts(3).subscribe(list => this.products = list, err => { console.warn('Failed to load featured products', err); this.products = []; });
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, ProductCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = () => this.auth.isAuthenticated();

  year = new Date().getFullYear();

  products: Product[] = [
    { id: 1, name: 'Plateau de fromages fermiers', price: 24.9, category: 'Fromages', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=60', description: 'Assortiment de 4 fromages artisanaux.' },
    { id: 2, name: 'Saucisson sec traditionnel', price: 12.5, category: 'Saucissons', image: 'https://images.unsplash.com/photo-1601924638867-3ec68b5b5227?auto=format&fit=crop&w=1200&q=60', description: 'Saucisson de porc fermier, affiné 6 semaines.' },
    { id: 3, name: 'Pâté de campagne', price: 8.0, category: 'Pâtés', image: 'https://images.unsplash.com/photo-1544025162-0c2242e3b2a2?auto=format&fit=crop&w=1200&q=60', description: 'Pâté maison à l’ancienne.' }
  ];

  viewProduct(id: number): void {
    // navigate to a product details route if available
    this.router.navigate(['/products', id]);
  }
}

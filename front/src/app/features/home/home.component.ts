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
    { id: 1, name: 'Plateau de fromages fermiers', price: 24.9, category: 'Fromages', 
      image: 'https://odelices.ouest-france.fr/images/articles/plateau-fromages.jpg', description: 'Assortiment de 4 fromages artisanaux.' },
    { id: 2, name: 'Saucisson sec traditionnel', price: 12.5, category: 'Saucissons', 
      image: 'https://e4axzwka7un.exactdn.com/wp-content/uploads/2025/09/recette-saucisson-sec-de-campagne.jpg?strip=all&lossy=1&resize=536%2C366&ssl=1', description: 'Saucisson de porc fermier, affiné 6 semaines.' },
    { id: 3, name: 'Pâté de campagne', price: 8.0, category: 'Pâtés', 
      image: 'https://www.coopchezvous.com/img/recipe/262.webp', description: 'Pâté maison à l’ancienne.' }
  ];

  viewProduct(id: number): void {
    // navigate to a product details route if available
    this.router.navigate(['/products', id]);
  }
}

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
  template: `

    <!-- Hero -->
    <section class="relative bg-cover bg-center h-[60vh] flex items-center" style="background-image: url('https://respyrenees.com/images/webresa/305/randonnee-pays-basque-famille.jpg')">
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative z-10 max-w-6xl mx-auto px-4 text-white">
        <div class="max-w-2xl">
          <h1 class="text-4xl sm:text-5xl font-extrabold mb-3">
          </h1>
          <p class="text-lg sm:text-xl text-red-100 mb-6">Produits artisanaux du terroir — fromages, saucissons, pâtés et jambons sélectionnés par des producteurs locaux.</p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/products" class="inline-block px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md">Découvrir les produits</a>
            <a *ngIf="!isAuthenticated()" routerLink="/auth/register" class="inline-block px-5 py-3 border border-white text-white rounded-md">S'inscrire</a>
            <a *ngIf="isAuthenticated()" routerLink="/dashboard" class="inline-block px-5 py-3 border border-white text-white rounded-md">Mon compte</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-12 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl font-bold mb-6">Nos catégories</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a routerLink="/products?category=fromages" class="p-6 bg-stone-50 rounded-lg text-center hover:shadow">
            <div class="text-4xl mb-2">🧀</div>
            <div class="font-semibold">Fromages</div>
          </a>
          <a routerLink="/products?category=saucissons" class="p-6 bg-stone-50 rounded-lg text-center hover:shadow">
            <div class="text-4xl mb-2">🥓</div>
            <div class="font-semibold">Saucissons</div>
          </a>
          <a routerLink="/products?category=pates" class="p-6 bg-stone-50 rounded-lg text-center hover:shadow">
            <div class="text-4xl mb-2">🥧</div>
            <div class="font-semibold">Pâtés</div>
          </a>
          <a routerLink="/products?category=jambons" class="p-6 bg-stone-50 rounded-lg text-center hover:shadow">
            <div class="text-4xl mb-2">🍖</div>
            <div class="font-semibold">Jambons</div>
          </a>
        </div>
      </div>
    </section>

    <!-- Featured products -->
    <section class="py-12 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl font-bold mb-6">Produits mis en avant</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-product-card *ngFor="let p of products" [product]="p" (view)="viewProduct($event)"></app-product-card>
        </div>
      </div>
    </section>
  `
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

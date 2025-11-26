import { Component, inject, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 h-14">
            <img src="/logo.png" alt="TheTerroir logo" class="h-10 sm:h-12 w-auto object-contain" />
          </a>

          <!-- Menu -->
          <div class="flex items-center space-x-4">
            
            <!-- Accueil -->
            <a routerLink="/" class="text-sm text-gray-700 hover:text-red-600">
              Accueil
            </a>

            <!-- Produits -->
            <a routerLink="/products" class="text-sm text-gray-700 hover:text-red-600">
              Produits
            </a>

            <!-- Panier -->
            <a routerLink="/cart" class="text-sm text-gray-700 hover:text-red-600">
              Panier <span *ngIf="itemsCount>0">({{ itemsCount }})</span>
            </a>
            <!-- Mes paniers (Find) -->
            <a *ngIf="isAuthenticated()" routerLink="/cart/find" class="text-sm text-gray-700 hover:text-red-600">
              Mes paniers
            </a>

            <!-- NON AUTHENTIFIÉ: bouton Se connecter -->
            <a *ngIf="!isAuthenticated()" 
               routerLink="/auth/login"
               class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
              Se connecter
            </a>

            <!-- AUTHENTIFIÉ: menu déroulant -->
            <div *ngIf="isAuthenticated() && (auth.currentUser$ | async) as user" class="relative">
              <button 
                class="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
                (click)="$event.stopPropagation(); menuOpen = !menuOpen">

                <img 
                  [src]="user?.picture || '/default-avatar.png'" 
                  (error)="onImgError($event)"
                  alt="avatar" 
                  class="w-8 h-8 rounded-full object-cover border" />

                <span>{{ user?.firstName || user?.username }}</span>
              </button>

              <!-- Sous-menu -->
              <div 
                *ngIf="menuOpen"
                class="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg py-2 z-50"
                (click)="$event.stopPropagation()">

                <a routerLink="/dashboard" 
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Mon compte
                </a>

                <button 
                  (click)="logout()"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Déconnexion
                </button>

              </div>
            </div>

          </div>

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  public auth = inject(AuthService);
  private router = inject(Router);
  private cartService = inject(CartService);
  public itemsCount = 0;
  private subs: Subscription[] = [];

  menuOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(_: MouseEvent) {
    this.menuOpen = false;
  }

  isAuthenticated = () => this.auth.isAuthenticated();

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.src = '/default-avatar.jpg';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    // subscribe to user changes and update cart count
    const s = this.auth.currentUser$.subscribe(async (user) => {
      if (user && user.id) {
        try {
          const res: any = await firstValueFrom(this.cartService.getCart(user.id));
          this.itemsCount = (res?.items || []).reduce((s: number, it: any) => s + (it.quantity || 0), 0);
        } catch (e) {
          this.itemsCount = 0;
        }
      } else {
        this.itemsCount = 0;
      }
    });
    this.subs.push(s);
    // refresh when the cart content changes
    const s2 = this.cartService.cartUpdated$.subscribe(async () => {
      const user = this.auth.currentUserValue;
      if (user && user.id) {
        try {
          const res: any = await firstValueFrom(this.cartService.getCart(user.id));
          this.itemsCount = (res?.items || []).reduce((s: number, it: any) => s + (it.quantity || 0), 0);
        } catch (e) {
          this.itemsCount = 0;
        }
      } else {
        this.itemsCount = 0;
      }
    });
    this.subs.push(s2);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}

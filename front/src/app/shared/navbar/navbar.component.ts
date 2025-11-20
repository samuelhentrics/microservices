import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center gap-3 h-14">
              <img src="/logo.png" alt="TheTerroir logo" class="h-10 sm:h-12 w-auto object-contain" />
            </a>
          </div>
          <div class="flex items-center space-x-4">
            <a routerLink="/" class="text-sm text-gray-700 hover:text-red-600">Accueil</a>
            <a *ngIf="isAuthenticated()" routerLink="/dashboard" class="text-sm text-gray-700 hover:text-red-600">Dashboard</a>
            <a *ngIf="isAuthenticated()" routerLink="/profile" class="text-sm text-gray-700 hover:text-red-600">Mon profil</a>
            <a *ngIf="!isAuthenticated()" routerLink="/auth/login" class="text-sm text-gray-700 hover:text-red-600">Se connecter</a>
            <a *ngIf="!isAuthenticated()" routerLink="/auth/register" class="text-sm text-gray-700 hover:text-red-600">S'inscrire</a>
            <button *ngIf="isAuthenticated()" (click)="logout()" class="ml-2 px-3 py-1 bg-red-500 text-white rounded text-sm">Déconnexion</button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  isAuthenticated = () => this.auth.isAuthenticated();

  logout(): void {
    this.auth.logout();
    // after logout, navigate to home
    this.router.navigate(['/']);
  }
}

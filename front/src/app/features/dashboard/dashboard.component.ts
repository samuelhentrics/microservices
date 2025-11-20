import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">

      <!-- Main Content -->
      <main class="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Welcome Card -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Bienvenue sur votre dashboard ! 🎉</h2>
          <p class="text-gray-600">Vous êtes maintenant connecté et authentifié.</p>
        </div>

        <!-- User Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Account Info -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Informations du compte</h3>
            <ul class="space-y-2 text-gray-700">
              <li><strong>Nom d'utilisateur:</strong> {{ currentUser?.username }}</li>
              <li><strong>Email:</strong> {{ currentUser?.email }}</li>
              <li><strong>ID Utilisateur:</strong> {{ currentUser?.id }}</li>
              <li *ngIf="currentUser?.firstName"><strong>Prénom:</strong> {{ currentUser?.firstName }}</li>
              <li *ngIf="currentUser?.lastName"><strong>Nom:</strong> {{ currentUser?.lastName }}</li>
            </ul>
          </div>

          <!-- Status Card -->
          <div class="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Statut</h3>
            <p class="text-green-600 font-bold">Actif</p>
          </div>

          <!-- Last Login Card -->
          <div class="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Dernière connexion</h3>
            <p class="text-gray-600">Aujourd'hui</p>
          </div>

          <!-- Performance Card -->
          <div class="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Performance</h3>
            <p class="text-blue-600 font-bold">Excellente</p>
          </div>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

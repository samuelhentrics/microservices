import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hero with video background and blur overlay -->
    <section class="relative h-[65vh] w-full overflow-hidden">
      <video class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline poster="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60">
        <!-- Example video source; replace with your own for production -->
        <source src="https://cdn.coverr.co/videos/coverr-a-city-at-sunset-1572?token=eyJhbGciOiJIUzI1NiJ9" type="video/mp4">
      </video>

      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div class="relative z-10 flex items-center justify-center h-full px-4">
        <div class="text-center max-w-4xl text-white">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">Découvrez un nouvel horizon</h1>
          <p class="text-lg sm:text-xl text-indigo-100 mb-6">Un template tout prêt pour vos connexions</p>
        </div>
      </div>
    </section>

    <!-- Info sections -->
    <section class="py-12 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 border rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Projet de test</h3>
            <p class="text-sm text-gray-600">Ce projet est un exemple simple qui propose une interface d'authentification (inscription, connexion) et un dashboard protégé. Idéal pour prototyper ou apprendre.</p>
          </div>
          <div class="p-6 border rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Fonctionnalités</h3>
            <ul class="text-sm text-gray-600 list-disc list-inside">
              <li>Inscription et connexion basiques</li>
              <li>Backend minimal (Express + Postgres)</li>
              <li>Composants Angular standalone, Tailwind CSS</li>
            </ul>
          </div>
          <div class="p-6 border rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Utilisation</h3>
            <p class="text-sm text-gray-600">Démarrez la base de données et le backend, puis accédez aux pages de connexion/inscription pour tester le flux d'authentification.</p>
          </div>
        </div>

        <div class="mt-10 bg-indigo-50 p-6 rounded-lg text-center">
          <p class="text-sm text-gray-700">Créé par <strong>Samuel HENTRICS</strong></p>
        </div>
      </div>
    </section>
    
  `
})
export class HomeComponent {
  private auth = inject(AuthService);
  isAuthenticated = this.auth.isAuthenticated;
}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        <!-- LEFT / BRAND -->
        <div class="hidden md:flex flex-col justify-center rounded-2xl bg-white/70 backdrop-blur border border-amber-100 p-8 shadow-sm">
          <img src="logo.png" alt="The Terroir - Pays Basque" class="w-full max-w-sm mx-auto mb-8 drop-shadow-sm" />

          <h1 class="text-3xl font-extrabold text-emerald-900 tracking-tight">
            Le Terroir Basque, chez vous 
          </h1>
          <p class="mt-3 text-emerald-950/80 leading-relaxed">
            Accédez à votre espace pour commander et retrouver vos produits locaux :
            <span class="font-semibold">fromages, charcuteries, piments, douceurs artisanales…</span>
          </p>

          <div class="mt-6 grid grid-cols-1 gap-3 text-sm">
            <div class="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-emerald-900">
              <span class="inline-flex items-center">
                <svg viewBox="0 0 3 2" class="w-6 h-4 rounded-sm shadow-sm" role="img" aria-label="Drapeau du Pays Basque">
                  <rect width="3" height="2" fill="#D52B1E"></rect>
                  <path d="M0 0 L3 2 M3 0 L0 2" stroke="#009B3A" stroke-width="0.45"></path>
                  <path d="M1.5 0 V2 M0 1 H3" stroke="#FFFFFF" stroke-width="0.32"></path>
                </svg>
              </span>
              <span>Producteurs & Artisans du Pays Basque</span>
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-emerald-900">
              <span class="text-lg">🚚</span>
              <span>Livraison partout en France</span>
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-emerald-900">
              <span class="text-lg">🔒</span>
              <span>Paiement sécurisé</span>
            </div>
          </div>

          <div class="mt-8 rounded-xl bg-emerald-900 text-amber-50 p-4">
            <p class="text-sm italic">
              “Une sélection authentique, directement depuis les fermes et ateliers locaux.”
            </p>
            <p class="text-xs mt-2 opacity-80">— L’équipe The Terroir</p>
          </div>
        </div>

        <!-- RIGHT / LOGIN CARD -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 md:p-8 mx-auto w-full max-w-md flex flex-col justify-center">
          <div class="flex justify-between items-center mb-5">
            <button type="button" (click)="goHome()"
              class="text-sm text-emerald-700 hover:text-emerald-600 font-medium">
              ← Accueil
            </button>
            <a routerLink="/auth/register"
               class="text-sm text-gray-600 hover:text-gray-900">
              Créer un compte
            </a>
          </div>

          <!-- Small logo on mobile -->
          <div class="md:hidden mb-6">
            <img src="logo.png" alt="The Terroir - Pays Basque" class="w-56 mx-auto" />
          </div>

          <h2 class="text-center text-2xl font-semibold text-emerald-950 mb-2">
            Connexion
          </h2>
          <p class="text-center text-sm text-gray-600 mb-5">
            Retrouvez vos commandes, adresses et favoris.
          </p>

          <!-- Google button area -->
          <div id="googleButton" class="flex justify-center mb-4"></div>

          <!-- separator -->
          <div class="flex items-center my-3">
            <div class="flex-1 h-px bg-gray-200"></div>
            <div class="px-3 text-xs text-gray-500">ou</div>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-800">
                Adresse e-mail
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                  [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  placeholder="Votre adresse email"
                />
              </div>
              <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                 class="mt-1 text-xs text-red-600">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">L'email est requis.</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Format d'email invalide.</span>
              </p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-800">
                Mot de passe
              </label>
              <div class="mt-1">
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  autocomplete="current-password"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                  [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="Votre mot de passe"
                />
              </div>
              <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                 class="mt-1 text-xs text-red-600">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Le mot de passe est requis.</span>
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']">
                  Le mot de passe est trop court (min 6 caractères).
                </span>
              </p>
            </div>

            <div *ngIf="errorMessage()" class="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
              {{ errorMessage() }}
            </div>

            <div>
              <button
                type="submit"
                [disabled]="loading()"
                class="w-full flex items-center justify-center gap-2 px-4 py-2
                       bg-emerald-700 text-white font-semibold rounded-md
                       hover:bg-emerald-800 disabled:opacity-60 transition"
              >
                <svg *ngIf="loading()" class="animate-spin h-5 w-5 text-white"
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span *ngIf="loading(); else notLoading">Connexion...</span>
                <ng-template #notLoading>Se connecter</ng-template>
              </button>
            </div>

            <div class="text-sm text-center">
              <a routerLink="/auth/register"
                 class="font-medium text-emerald-700 hover:text-emerald-600">
                Pas encore de compte ? S'inscrire
              </a>
            </div>

            <p class="text-[11px] text-center text-gray-400 pt-2">
              En vous connectant, vous acceptez nos conditions et notre politique de confidentialité.
            </p>
          </form>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (environment.googleClientId) {
      const existing = document.getElementById('google-sdk');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-sdk';
        script.async = true;
        script.defer = true;
        script.onload = () => this.initGoogle();
        document.head.appendChild(script);
      } else {
        this.initGoogle();
      }
    }
  }

  private initGoogle() {
    try {
      const gid = (window as any).google?.accounts?.id;
      if (!gid) return;
      (window as any).google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (res: any) => this.onGoogleCredential(res)
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById('googleButton'),
        { theme: 'outline', size: 'large', width: 300 }
      );
    } catch (err) {
      console.warn('Google Identity SDK failed to initialize', err);
    }
  }

  private onGoogleCredential(res: any) {
    const idToken = res?.credential;
    if (!idToken) return;

    this.loading.set(true);

    this.http.post(`${environment.apiUrl}/auth/google`, { idToken }).subscribe({
      next: (response: any) => {
        this.authService.processAuthResponse(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Google login error', err);
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          const msg =
            error?.error?.error ||
            error?.error?.message ||
            error?.message ||
            'Une erreur est survenue';
          this.errorMessage.set(msg);
          this.loading.set(false);
        }
      });
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

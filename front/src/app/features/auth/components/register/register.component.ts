import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        <!-- LEFT / BRAND -->
        <div class="hidden md:flex flex-col justify-center rounded-2xl bg-white/70 backdrop-blur border border-amber-100 p-8 shadow-sm">
          <img src="logo.png" alt="The Terroir - Pays Basque" class="w-full max-w-sm mx-auto mb-8 drop-shadow-sm" />

          <h1 class="text-3xl font-extrabold text-emerald-900 tracking-tight">
            Créez votre compte
          </h1>
          <p class="mt-3 text-emerald-950/80 leading-relaxed">
            Rejoignez <span class="font-semibold">The Terroir</span> et profitez d’une sélection
            authentique de produits du Pays Basque, livrés chez vous.
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

        <!-- RIGHT / REGISTER CARD -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 md:p-8 mx-auto w-full max-w-md flex flex-col justify-center">
          <div class="flex justify-between items-center mb-5">
            <button type="button" (click)="goHome()"
              class="text-sm text-emerald-700 hover:text-emerald-600 font-medium">
              ← Accueil
            </button>
            <a routerLink="/auth/login"
               class="text-sm text-gray-600 hover:text-gray-900">
              Se connecter
            </a>
          </div>

          <!-- Small logo on mobile -->
          <div class="md:hidden mb-6">
            <img src="logo.png" alt="The Terroir - Pays Basque" class="w-56 mx-auto" />
          </div>

          <h2 class="text-center text-2xl font-semibold text-emerald-950 mb-2">
            Inscription
          </h2>
          <p class="text-center text-sm text-gray-600 mb-5">
            Créez votre compte pour suivre vos commandes et favoris.
          </p>

          <!-- Google button area -->
          <div id="googleButton" class="flex justify-center mb-4"></div>

          <!-- separator -->
          <div class="flex items-center my-3">
            <div class="flex-1 h-px bg-gray-200"></div>
            <div class="px-3 text-xs text-gray-500">ou</div>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-800">
                Nom d'utilisateur
              </label>
              <div class="mt-1">
                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  autocomplete="username"
                  placeholder="Votre nom d'utilisateur"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                  [class.border-red-500]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
                />
              </div>
              <p *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
                 class="mt-1 text-xs text-red-600">
                <span *ngIf="registerForm.get('username')?.errors?.['required']">Le nom d'utilisateur est requis.</span>
                <span *ngIf="registerForm.get('username')?.errors?.['minlength']">Minimum 3 caractères.</span>
              </p>
            </div>

            <!-- Email -->
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
                  placeholder="Votre adresse email"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                  [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                />
              </div>
              <p *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                 class="mt-1 text-xs text-red-600">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">L'email est requis.</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Format d'email invalide.</span>
              </p>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-800">
                Mot de passe
              </label>
              <div class="mt-1">
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  autocomplete="new-password"
                  placeholder="Minimum 6 caractères"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                  [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                />
              </div>
              <p *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                 class="mt-1 text-xs text-red-600">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Le mot de passe est requis.</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Minimum 6 caractères.</span>
              </p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-800">
                Confirmer le mot de passe
              </label>
              <div class="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  autocomplete="new-password"
                  placeholder="Retapez le mot de passe"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                  [class.border-red-500]="(registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched)
                    || (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched)"
                />
              </div>
              <p *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
                 class="mt-1 text-xs text-red-600">
                Les mots de passe ne correspondent pas.
              </p>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
              {{ errorMessage() }}
            </div>

            <!-- Submit Button -->
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
                <span *ngIf="loading(); else notLoading">Inscription...</span>
                <ng-template #notLoading>S'inscrire</ng-template>
              </button>
            </div>

            <div class="text-sm text-center">
              <a routerLink="/auth/login"
                 class="font-medium text-emerald-700 hover:text-emerald-600">
                Déjà un compte ? Se connecter
              </a>
            </div>

            <p class="text-[11px] text-center text-gray-400 pt-2">
              En créant un compte, vous acceptez nos conditions et notre politique de confidentialité.
            </p>
          </form>
        </div>

      </div>
    </div>
  `
})
export class RegisterComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  registerForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    if (environment.googleClientId) {
      const existing = document.getElementById('google-sdk');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-sdk';
        script.async = true;
        script.defer = true;
        // init will be called on load (and also in ngAfterViewInit if already present)
        script.onload = () => this.initGoogle();
        document.head.appendChild(script);
      }
      // if script already exists, defer initialization to ngAfterViewInit so the button container exists
    }
  }

  ngAfterViewInit(): void {
    if (!environment.googleClientId) return;
    try {
      // @ts-ignore
      const gid = (window as any).google?.accounts?.id;
      if (gid) {
        this.initGoogle();
      }
    } catch (err) {
      // ignore
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
        console.error('Google signup error', err);
        this.loading.set(false);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      this.authService.register(this.registerForm.value).subscribe({
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

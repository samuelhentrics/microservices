import { Component, inject, signal, OnInit } from '@angular/core';
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
    <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <!-- left panel: marketing / brand -->
        <div class="hidden md:flex flex-col justify-center px-6">
          <div class="mb-6">
            <h1 class="text-3xl font-extrabold text-indigo-700">MonApp</h1>
            <p class="mt-2 text-gray-600">Accédez à votre tableau de bord et gérez votre compte en toute simplicité.</p>
          </div>
          <div class="rounded-lg bg-indigo-50 p-4">
            <p class="text-sm text-indigo-600">Sécurité, confidentialité et connexion rapide.</p>
          </div>
        </div>

        <!-- right panel: card -->
        <div class="bg-white rounded-xl shadow-lg p-6 mx-auto max-w-md w-full">
          <div class="flex justify-between items-center mb-4">
            <button type="button" (click)="goHome()" class="text-sm text-indigo-600 hover:text-indigo-500">← Accueil</button>
            <a routerLink="/auth/register" class="text-sm text-gray-600 hover:text-gray-800">Créer un compte</a>
          </div>

          <h2 class="text-center text-2xl font-semibold text-gray-800 mb-4">Connexion</h2>

          <!-- Google button area (rendered by Google Identity SDK) -->
          <div id="googleButton" class="flex justify-center mb-4"></div>

          <!-- separator -->
          <div class="flex items-center my-3">
            <div class="flex-1 h-px bg-gray-200"></div>
            <div class="px-3 text-xs text-gray-500">ou</div>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <div class="mt-1">
                <input id="email" type="email" formControlName="email" autocomplete="email"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" />
              </div>
              <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="mt-1 text-xs text-red-600">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">L'email est requis.</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Format d'email invalide.</span>
              </p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <div class="mt-1">
                <input id="password" type="password" formControlName="password" autocomplete="current-password"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" />
              </div>
              <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="mt-1 text-xs text-red-600">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Le mot de passe est requis.</span>
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Le mot de passe est trop court (min 6 caractères).</span>
              </p>
            </div>

            <div *ngIf="errorMessage()" class="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
              {{ errorMessage() }}
            </div>

            <div>
              <button type="submit" [disabled]="loading()"
                class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-60">
                <svg *ngIf="loading()" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span *ngIf="loading(); else notLoading">Connexion...</span>
                <ng-template #notLoading>Se connecter</ng-template>
              </button>
            </div>

            <div class="text-sm text-center">
              <a routerLink="/auth/register" class="font-medium text-indigo-600 hover:text-indigo-500">Pas encore de compte ? S'inscrire</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  // add HttpClient for Google token exchange
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

    // load Google Identity Services if client id provided
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
      // @ts-ignore
      const gid = (window as any).google?.accounts?.id;
      if (!gid) return;
      // @ts-ignore
      google.accounts.id.initialize({ client_id: environment.googleClientId, callback: (res: any) => this.onGoogleCredential(res) });
      // render the button
      // @ts-ignore
      google.accounts.id.renderButton(document.getElementById('googleButton'), { theme: 'outline', size: 'large', width: 300 });
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
        // process response through AuthService
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
          const msg = error?.error?.error || error?.error?.message || error?.message || 'Une erreur est survenue';
          this.errorMessage.set(msg);
          this.loading.set(false);
        }
      });
    }
  }

  // Navigate back to home
  goHome(): void {
    this.router.navigate(['/']);
  }
}
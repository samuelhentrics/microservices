import { Component, inject, signal } from '@angular/core';
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
    <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div class="hidden md:flex flex-col justify-center px-6">
          <h1 class="text-3xl font-extrabold text-indigo-700">Créer un compte</h1>
          <p class="mt-2 text-gray-600">Inscrivez-vous rapidement avec votre compte Google ou créez un compte local.</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 mx-auto max-w-md w-full">
          <div class="flex justify-between items-center mb-4">
            <button type="button" (click)="goHome()" class="text-sm text-indigo-600 hover:text-indigo-500">← Accueil</button>
            <a routerLink="/auth/login" class="text-sm text-gray-600 hover:text-gray-800">Se connecter</a>
          </div>

          <h2 class="text-center text-2xl font-semibold text-gray-800 mb-4">Inscription</h2>

          <!-- Google button area (rendered by Google Identity SDK) -->
          <div id="googleButton" class="flex justify-center mb-4"></div>

          <div class="flex items-center my-3">
            <div class="flex-1 h-px bg-gray-200"></div>
            <div class="px-3 text-xs text-gray-500">ou</div>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
              <div class="mt-1">
                <input id="username" type="text" formControlName="username" autocomplete="username"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-500]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" />
              </div>
              <p *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" class="mt-1 text-xs text-red-600">
                <span *ngIf="registerForm.get('username')?.errors?.['required']">Le nom d'utilisateur est requis.</span>
                <span *ngIf="registerForm.get('username')?.errors?.['minlength']">Minimum 3 caractères.</span>
              </p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <div class="mt-1">
                <input id="email" type="email" formControlName="email" autocomplete="email"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" />
              </div>
              <p *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="mt-1 text-xs text-red-600">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">L'email est requis.</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Format d'email invalide.</span>
              </p>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <div class="mt-1">
                <input id="password" type="password" formControlName="password" autocomplete="new-password"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" />
              </div>
              <p *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="mt-1 text-xs text-red-600">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Le mot de passe est requis.</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Minimum 6 caractères.</span>
              </p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <div class="mt-1">
                <input id="confirmPassword" type="password" formControlName="confirmPassword" autocomplete="new-password"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-500]="(registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) || (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched)" />
              </div>
              <p *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched" class="mt-1 text-xs text-red-600">
                Les mots de passe ne correspondent pas.
              </p>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
              {{ errorMessage() }}
            </div>

            <!-- Submit Button -->
            <div>
              <button type="submit" [disabled]="loading()"
                class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-60">
                <svg *ngIf="loading()" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span *ngIf="loading(); else notLoading">Inscription...</span>
                <ng-template #notLoading>S'inscrire</ng-template>
              </button>
            </div>

            <div class="text-sm text-center">
              <a routerLink="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">Déjà un compte ? Se connecter</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
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
      return { 'passwordMismatch': true };
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

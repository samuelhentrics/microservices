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
  templateUrl: './login.component.html'
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

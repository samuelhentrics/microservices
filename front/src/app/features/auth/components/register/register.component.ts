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
  templateUrl: './register.component.html'
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

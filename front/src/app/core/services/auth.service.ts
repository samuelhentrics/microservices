import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);

  private currentUserSubject = new BehaviorSubject<User | null>(this.storageService.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal pour Angular v20
  public isAuthenticated = signal<boolean>(!!this.storageService.getToken());

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  logout(): void {
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.getRefreshToken();
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.storageService.setToken(response.token);
    if (response.refreshToken) {
      this.storageService.setRefreshToken(response.refreshToken);
    }
    this.storageService.setUser(response.user);
    this.currentUserSubject.next(response.user);
    this.isAuthenticated.set(true);
  }

  // Public helper for external auth flows (Google, etc.)
  public processAuthResponse(response: AuthResponse): void {
    this.handleAuthResponse(response);
  }

  // Update the current user locally (used after profile edits)
  public updateCurrentUser(user: User): void {
    this.storageService.setUser(user);
    this.currentUserSubject.next(user);
  }
}
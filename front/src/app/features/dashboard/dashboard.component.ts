import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User, Address } from '../../core/models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  currentUser: User | null = null;
  address: Address = {};

  // simulated orders
  orders: Array<any> = [
    { id: '1001', date: '2025-11-18', status: 'Livrée', items: [{}, {}], total: 49.5 },
    { id: '1002', date: '2025-11-05', status: 'En cours', items: [{}, {}, {}], total: 79.2 }
  ];

  // profile editing state
  editingProfile = false;
  model: any = { username: '', firstName: '', lastName: '', picture: '' };
  pictureFile: File | null = null;
  picturePreview: string | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadAddress();
  }

  logout(): void {
    this.authService.logout();
  }

  loadAddress(): void {
    this.http.get<{ address: Address }>(`${environment.apiUrl}/users/me/address`).subscribe({
      next: res => {
        this.address = res.address || {};
      },
      error: err => console.error('Failed to load address', err)
    });
  }

  saveAddress(): void {
    const payload = {
      line1: this.address.line1,
      line2: this.address.line2,
      city: this.address.city,
      postal_code: this.address.postalCode,
      country: this.address.country
    };
    this.http.put<{ address: Address }>(`${environment.apiUrl}/users/me/address`, payload).subscribe({
      next: res => {
        this.address = res.address;
      },
      error: err => console.error('Failed to save address', err)
    });
  }

  onFileSelectedProfile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.pictureFile = file;
    this.readFileAsDataUrl(file).then(d => this.picturePreview = d).catch(err => console.error(err));
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  toggleEditingProfile(): void {
    this.editingProfile = !this.editingProfile;
    if (this.editingProfile && this.currentUser) {
      this.model = { username: this.currentUser.username || '', firstName: this.currentUser.firstName || '', lastName: this.currentUser.lastName || '', picture: this.currentUser.picture || '' };
      this.picturePreview = this.currentUser.picture || null;
      this.pictureFile = null;
    }
  }

  saveProfile(): void {
    const prepareAndSend = async () => {
      try {
        let pictureToSend = this.model.picture || null;
        if (this.pictureFile) {
          pictureToSend = await this.readFileAsDataUrl(this.pictureFile);
        }
        const payload = {
          username: this.model.username,
          first_name: this.model.firstName,
          last_name: this.model.lastName,
          picture: pictureToSend
        };
        this.http.put<{ user: User }>(`${environment.apiUrl}/users/me`, payload).subscribe({
          next: res => {
            // update current user in auth service
            this.authService.updateCurrentUser(res.user);
            this.currentUser = res.user;
            this.editingProfile = false;
            this.pictureFile = null;
            this.picturePreview = res.user.picture || null;
          },
          error: err => console.error('Failed to save profile', err)
        });
      } catch (err) {
        console.error('Failed processing profile image', err);
      }
    };
    void prepareAndSend();
  }
}

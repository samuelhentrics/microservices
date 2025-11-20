import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Mon profil</h2>

      <div class="flex items-center space-x-6">
        <img *ngIf="user?.picture; else emptyAvatar" [src]="user?.picture" alt="avatar" class="w-24 h-24 rounded-full object-cover border-2 border-red-500">
        <ng-template #emptyAvatar>
          <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">A</div>
        </ng-template>

        <div class="flex-1">
          <h3 class="text-xl font-semibold">{{ user?.username }}</h3>
          <p class="text-sm text-gray-600">{{ user?.email }}</p>
        </div>

        <div>
          <button class="bg-red-600 text-white px-4 py-2 rounded" (click)="toggleEdit()">{{ editing ? 'Annuler' : 'Modifier' }}</button>
        </div>
      </div>

      <form *ngIf="editing" (ngSubmit)="save()" class="mt-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Prénom</label>
            <input [(ngModel)]="model.firstName" name="firstName" class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nom</label>
            <input [(ngModel)]="model.lastName" name="lastName" class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Pseudo</label>
          <input [(ngModel)]="model.username" name="username" class="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">URL Photo de profil</label>
          <input [(ngModel)]="model.picture" name="picture" class="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <div class="flex justify-end space-x-2">
          <button type="button" class="px-4 py-2 border rounded" (click)="toggleEdit()">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  user: User | null = null;
  model: any = { username: '', firstName: '', lastName: '', picture: '' };
  editing = false;
  // local file for avatar upload
  pictureFile: File | null = null;
  picturePreview: string | null = null;

  ngOnInit(): void {
    this.loadProfile();
    this.authService.currentUser$.subscribe(u => this.user = u);
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    if (this.editing && this.user) {
      // copy current values into model
      this.model = { username: this.user.username, firstName: this.user.firstName || '', lastName: this.user.lastName || '', picture: this.user.picture || '' };
      this.picturePreview = this.user.picture || null;
      this.pictureFile = null;
    }
  }

  loadProfile(): void {
    this.http.get<{ user: User }>(`${environment.apiUrl}/users/me`).subscribe({
      next: res => {
        this.user = res.user;
        this.authService.updateCurrentUser(res.user);
      },
      error: err => console.error('Failed to load profile', err)
    });
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async save(): Promise<void> {
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
          this.user = res.user;
          this.authService.updateCurrentUser(res.user);
          this.editing = false;
          this.pictureFile = null;
          this.picturePreview = res.user.picture || null;
        },
        error: err => console.error('Failed to save profile', err)
      });
    } catch (err) {
      console.error('Error processing image file', err);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.pictureFile = file;
    // show preview immediately
    this.readFileAsDataUrl(file).then(dataUrl => this.picturePreview = dataUrl).catch(err => console.error(err));
  }
}

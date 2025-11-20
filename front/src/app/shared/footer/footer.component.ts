import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-gray-800 text-gray-200 py-6">
      <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div class="text-sm">© {{ currentYear }} MyLoginApp</div>
        <div class="text-sm">Projet de démonstration — Authentification basique (Express + Postgres)</div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

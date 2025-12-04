import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-800 text-gray-200 py-6">
      <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div class="text-sm">© {{ currentYear }} TheTerroir</div>
        <div class="text-sm">Produits du terroir sélectionnés avec soin.</div>
        <div class="text-sm">
          <a routerLink="/health" class="underline hover:text-white">Vérifier l'état des services</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  showLayout = true;

  ngOnInit(): void {
    // Hide navbar/footer on auth pages (routes under /auth)
    // Evaluate initial URL
    this.updateLayoutVisibility(this.router.url || '');

    // Update on navigation end
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(e => {
      const url = e.urlAfterRedirects || e.url;
      this.updateLayoutVisibility(url);
    });
  }

  private updateLayoutVisibility(url: string) {
    this.showLayout = !url.startsWith('/auth');
  }
}

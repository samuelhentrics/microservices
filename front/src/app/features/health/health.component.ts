import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

type PingResult = {
  ok: boolean;
  status?: number;
  timeMs?: number;
  body?: any;
  error?: string;
  checkedAt?: string;
};

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health.component.html'
})
export class HealthComponent {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  // expose environment to template
  environment = environment;

  auth: PingResult | null = null;
  products: PingResult | null = null;

  constructor() {
    this.pingAll();
  }

  private async doPing(url: string): Promise<PingResult> {
    const start = Date.now();
    const timeoutMs = 2000;
    let timeoutId: any;
    const reqPromise = firstValueFrom(this.http.get<any>(url, { observe: 'response' as any }));
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    });

    try {
      const resp = await Promise.race([reqPromise, timeoutPromise]) as HttpResponse<any> | undefined;
      clearTimeout(timeoutId);
      const timeMs = Date.now() - start;
      const checkedAt = new Date().toISOString();
      if (!resp) return { ok: false, timeMs, checkedAt, error: 'No response received' };
      return { ok: true, status: resp.status, timeMs, checkedAt, body: resp.body };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const timeMs = Date.now() - start;
      const checkedAt = new Date().toISOString();
      const message = err?.message || String(err);
      const error = message === 'timeout' ? `Timeout after ${timeoutMs}ms` : message;
      return { ok: false, timeMs, checkedAt, error };
    }
  }

  async pingAuth() {
    this.auth = null;
    const url = `${environment.apiUrl}/auth/health`;
    console.log('[health] pingAuth ->', url);
    this.auth = await this.doPing(url);
    console.log('[health] auth result ->', this.auth);
    this.cdr.detectChanges();
  }

  async pingProducts() {
    this.products = null;
    const url = `${environment.apiUrl}/products/health`;
    // products microservice provides /api/health (not /products/health) — call both possibilities
    const candidate1 = `${environment.apiUrl}/products/health`;
    const candidate2 = `${environment.apiUrl}/products`;

    // try candidate1, if 404 or error, try /products/random
    console.log('[health] pingProducts try1 ->', candidate1);
    this.products = await this.doPing(candidate1);
    console.log('[health] products result try1 ->', this.products);
    if (!this.products.ok) {
      // try products root /api/products (list)
      const alt = `${environment.apiUrl}/products`;
      console.log('[health] pingProducts try2 ->', alt);
      this.products = await this.doPing(alt);
      console.log('[health] products result try2 ->', this.products);
    }
    this.cdr.detectChanges();
  }

  pingAll() {
    this.pingAuth();
    this.pingProducts();
  }
}

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
  imports: [CommonModule, HttpClientModule],
  templateUrl: './health.component.html'
})
export class HealthComponent {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  // expose environment to template
  environment = environment;

  auth: PingResult | null = null;
  products: PingResult | null = null;
  monitoring: PingResult | null = null;
  // history arrays for rendering bars
  authHistory: PingResult[] = [];
  productsHistory: PingResult[] = [];

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
    // Fetch latest and recent history for auth
    this.auth = await this.fetchHistory('auth');
    this.authHistory = await this.fetchHistorySeries('auth', 24);
    console.log('[health] auth result ->', this.auth);

    this.cdr.detectChanges();
  }

  async pingProducts() {
    this.products = null;
    const url = `${environment.apiUrl}/products/health`;
    // products microservice provides /api/health (not /products/health) — call both possibilities
    const candidate1 = `${environment.apiUrl}/products/health`;
    this.products = await this.doPing(candidate1);
    if (!this.products.ok) {
        console.log('[health] products failed');
    }

    // get history 
    this.productsHistory = await this.fetchHistorySeries('products', 24);

    this.cdr.detectChanges();
  }

  async pingMonitoring() {
    this.monitoring = null;
    const url = `${environment.apiUrl}/monitoring/health`;
    console.log('[health] pingMonitoring ->', url);

    this.monitoring = await this.fetchHistory('monitoring');
    console.log('[health] monitoring result ->', this.monitoring);
    this.cdr.detectChanges();
  }

  pingAll() {
    this.pingAuth();
    this.pingProducts();
    //this.pingMonitoring();
  }

  // Query the monitoring service for the most recent log for `service`
  private async fetchHistory(service: string): Promise<PingResult> {
    const url = `${environment.apiUrl}/monitoring/logs?service=${encodeURIComponent(service)}&limit=1`;
    try {
      const resp = await firstValueFrom(this.http.get<any>(url));
      const rows = resp?.rows || [];
      if (rows.length === 0) return { ok: false, error: 'No history', checkedAt: new Date().toISOString() };
      const r = rows[0];
      // Map DB columns to PingResult
      const checkedAt = r.checked_at || r.checkedAt || new Date().toISOString();
      return {
        ok: !!r.ok,
        status: r.status ?? undefined,
        timeMs: r.time_ms ?? r.timeMs ?? undefined,
        body: r.body ?? undefined,
        error: r.error ?? undefined,
        checkedAt: checkedAt
      };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), checkedAt: new Date().toISOString() };
    }
  }

  // Fetch last `limit` entries for a service, ordered oldest->newest
  private async fetchHistorySeries(service: string, limit = 24): Promise<PingResult[]> {
    const url = `${environment.apiUrl}/monitoring/logs?service=${encodeURIComponent(service)}&limit=${limit}`;
    try {
      const resp = await firstValueFrom(this.http.get<any>(url));
      const rows = resp?.rows || [];
      // rows come newest first, we want oldest -> newest for display
      const ordered = rows.slice().reverse();
      return ordered.map((r: any) => ({
        ok: !!r.ok,
        status: r.status ?? undefined,
        timeMs: r.time_ms ?? undefined,
        body: r.body ?? undefined,
        error: r.error ?? undefined,
        checkedAt: r.checked_at || r.checkedAt || undefined
      }));
    } catch (err: any) {
      // return an array with a single error entry
      return [{ ok: false, error: err?.message || String(err), checkedAt: new Date().toISOString() }];
    }
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CouponDetail, CouponSummary } from '../models/coupon';
import { Store } from '../models/store';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = environment.apiBaseUrl;

  // Interruptor de demo: con esto en true la próxima carga falla sin llegar a la
  // red, así los estados de error se pueden ver desde el catálogo sin apagar el
  // backend. Sigue vivo porque, con la API real, es la única forma de provocar
  // un error a voluntad.
  readonly failNextRequest = signal(false);

  // Ya no arranca desde localStorage: los guardados son del servidor, y el
  // navegador solo los refleja. Empieza vacío y se llena al confirmar la sesión.
  private readonly activated = signal<readonly string[]>([]);
  readonly activatedIds = this.activated.asReadonly();

  constructor() {
    // Los cupones guardados cuelgan de la cuenta: al entrar se traen del
    // servidor y al salir dejan de ser de nadie.
    effect(() => {
      if (this.auth.isSignedIn()) {
        void this.hydrateActivated();
      } else {
        this.activated.set([]);
      }
    });
  }

  stores(): Promise<readonly Store[]> {
    return this.request(() => this.http.get<Store[]>(`${this.api}/stores`));
  }

  // Los dos filtros van juntos en un solo método porque en la API son dos query
  // params del mismo endpoint, no dos endpoints.
  list(params: { storeId: string | null; query: string }): Promise<readonly CouponSummary[]> {
    let query = new HttpParams();

    // Los vacíos no se mandan: /coupons y /coupons?q= son la misma pregunta pero
    // dos URLs distintas para cualquier caché que haya en el medio.
    if (params.storeId) query = query.set('storeId', params.storeId);

    const term = params.query.trim();
    if (term) query = query.set('q', term);

    return this.request(() =>
      this.http.get<CouponSummary[]>(`${this.api}/coupons`, { params: query }),
    );
  }

  myCoupons(): Promise<readonly CouponSummary[]> {
    return this.request(() => this.http.get<CouponSummary[]>(`${this.api}/me/coupons`));
  }

  detail(id: string): Promise<CouponDetail> {
    return this.request(() =>
      this.http.get<CouponDetail>(`${this.api}/coupons/${encodeURIComponent(id)}`),
    );
  }

  // PUT y no POST: activar dos veces el mismo cupón tiene que dar el mismo
  // resultado, porque un doble toque en el botón no es un error del usuario.
  async activate(id: string): Promise<void> {
    await this.request(() =>
      this.http.put<void>(`${this.api}/me/coupons/${encodeURIComponent(id)}`, null),
    );

    this.activated.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }

  isActivated(id: string): boolean {
    return this.activated().includes(id);
  }

  // Un solo lugar donde vive el interruptor de fallas, para que los cinco
  // métodos se comporten igual y no haya uno que se olvide de fallar.
  private request<T>(send: () => Observable<T>): Promise<T> {
    if (this.failNextRequest()) {
      return Promise.reject(new Error('No se pudo contactar al servidor de cupones.'));
    }

    return firstValueFrom(send());
  }

  // Deliberadamente no pasa por request(): esto no es una carga que el usuario
  // haya pedido, así que el interruptor de demo no tiene por qué romperla.
  private async hydrateActivated(): Promise<void> {
    try {
      const mine = await firstValueFrom(
        this.http.get<CouponSummary[]>(`${this.api}/me/coupons`),
      );

      this.activated.set(mine.map((coupon) => coupon.id));
    } catch {
      // Si falla se queda vacío. Es preferible ofrecer «activar» sobre algo ya
      // activado que decir «ya está» sobre algo que el servidor no tiene.
    }
  }
}

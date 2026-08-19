import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CouponDetail, CouponSummary } from '../models/coupon';
import { Store } from '../models/store';
import { AuthService } from './auth.service';

// Cuánto vale una respuesta antes de volver a pedirla. Cinco minutos es holgado
// para un catálogo que se actualiza una vez por día, y corto para que nadie se
// quede mirando algo viejo en una sesión larga.
const CACHE_TTL_MS = 5 * 60 * 1000;

// La clave del listado incluye el texto buscado, así que alguien que teclea
// mucho haría crecer el Map sin techo. El límite es la única razón por la que
// esto no es una fuga de memoria lenta.
const MAX_CACHE_ENTRIES = 50;

interface CacheEntry {
  readonly value: Promise<unknown>;
  readonly storedAt: number;
}

// Fuera de la clase porque no depende de nada suyo: compara contenido, que es lo
// que importa acá, y no identidad, que es lo que compara un signal.
function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = environment.apiBaseUrl;

  // El servicio es singleton y las páginas no: volver de un cupón destruye la
  // home y la recrea, y sin esto sus resource() vuelven a pedir todo de nuevo.
  // Acá adentro las respuestas sobreviven a la navegación, así que «atrás» pinta
  // al instante en vez de mostrar tres siluetas y esperar a la red.
  private readonly cache = new Map<string, CacheEntry>();

  // Interruptor de demo: con esto en true la próxima carga falla sin llegar a la
  // red, así los estados de error se pueden ver desde el catálogo sin apagar el
  // backend. Sigue vivo porque, con la API real, es la única forma de provocar
  // un error a voluntad.
  readonly failNextRequest = signal(false);

  // Los guardados son del servidor y el navegador solo los refleja: empieza
  // vacío y se llena al confirmar la sesión.
  private readonly activated = signal<readonly string[]>([]);
  readonly activatedIds = this.activated.asReadonly();

  constructor() {
    // El efecto corre por primera vez *después* de que las páginas ya pidieron
    // datos, no antes. Sin esta bandera, el arranque —donde todavía no hay
    // sesión— entraba por la rama de abajo y borraba la caché que la home
    // acababa de llenar, así que el primer «atrás» pedía todo de nuevo.
    let habiaSesion = false;

    effect(() => {
      const haySesion = this.auth.isSignedIn();

      if (haySesion) {
        void this.hydrateActivated();
      } else {
        this.activated.set([]);

        // Higiene, no correctitud: las claves ya llevan el id de la cuenta, así
        // que nada del usuario anterior se puede leer igual. Pero tampoco tiene
        // por qué seguir en memoria después de que se fue.
        if (habiaSesion) this.cache.clear();
      }

      habiaSesion = haySesion;
    });
  }

  stores(): Promise<readonly Store[]> {
    return this.cached(this.scoped('stores'), () => this.http.get<Store[]>(`${this.api}/stores`));
  }

  // Los dos filtros van juntos en un solo método porque en la API son dos query
  // params del mismo endpoint, no dos endpoints.
  list(params: { storeId: string | null; query: string }): Promise<readonly CouponSummary[]> {
    let query = new HttpParams();

    // Los vacíos no se mandan: /coupons y /coupons?q= son la misma pregunta pero
    // dos URLs distintas, y también dos entradas distintas en la caché.
    if (params.storeId) query = query.set('storeId', params.storeId);

    const term = params.query.trim();
    if (term) query = query.set('q', term);

    return this.cached(`coupons?${query.toString()}`, () =>
      this.http.get<CouponSummary[]>(`${this.api}/coupons`, { params: query }),
    );
  }

  myCoupons(): Promise<readonly CouponSummary[]> {
    return this.cached(this.scoped('me/coupons'), () =>
      this.http.get<CouponSummary[]>(`${this.api}/me/coupons`),
    );
  }

  detail(id: string): Promise<CouponDetail> {
    return this.cached(`coupons/${id}`, () =>
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

    // La lista de guardados dejó de ser cierta en este mismo instante. Sin esto,
    // «Mis cupones» mostraría el estado anterior hasta que venciera el TTL.
    this.cache.delete(this.scoped('me/coupons'));
  }

  isActivated(id: string): boolean {
    return this.activated().includes(id);
  }

  // Lo que depende de la cuenta lleva su id en la clave. Así entrar y salir no
  // necesita que ningún efecto limpie la caché a tiempo —cambia la clave y el
  // hit se pierde solo—, y la sesión de un usuario nunca puede leer lo que quedó
  // guardado de otro.
  private scoped(key: string): string {
    return `${key}:${this.auth.user()?.id ?? 'anon'}`;
  }

  // Guarda la promesa y no el valor: dos pantallas que piden lo mismo al mismo
  // tiempo comparten una sola request en vez de disparar dos.
  private cached<T>(key: string, send: () => Observable<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.storedAt < CACHE_TTL_MS) return hit.value as Promise<T>;

    const value = this.request(send);
    this.remember(key, value);

    return value;
  }

  private remember(key: string, value: Promise<unknown>): void {
    // Un error no se queda guardado: si no, el primer fallo de red dejaría la
    // pantalla rota durante todo el TTL y ni el botón de reintentar la sacaría.
    value.catch(() => this.cache.delete(key));

    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      // Map recuerda el orden de inserción, así que la primera clave es la más
      // vieja y la que menos chances tiene de volver a pedirse.
      const oldest = this.cache.keys().next();
      if (!oldest.done) this.cache.delete(oldest.value);
    }

    this.cache.set(key, { value, storedAt: Date.now() });
  }

  // Un solo lugar donde vive el interruptor de fallas, para que los métodos se
  // comporten igual y no haya uno que se olvide de fallar.
  private request<T>(send: () => Observable<T>): Promise<T> {
    if (this.failNextRequest()) {
      return Promise.reject(new Error('No se pudo contactar al servidor de cupones.'));
    }

    return firstValueFrom(send());
  }

  // Pasa por la caché como cualquier otra carga, y no la invalida antes: al
  // entrar, la clave lleva un id de usuario que recién aparece, así que igual es
  // un fallo de caché. Borrarla «por las dudas» garantizaba un segundo pedido
  // cada vez que «Mis cupones» ya había traído lo mismo un instante antes.
  private async hydrateActivated(): Promise<void> {
    try {
      const mine = await this.myCoupons();

      // update() y no set(): un array nuevo con el mismo contenido igual
      // notifica a todos los que miran activatedIds, y «Mis cupones» lo tiene en
      // los params de su resource. Sería una recarga entera de la pantalla para
      // terminar mostrando exactamente lo mismo.
      const ids = mine.map((coupon) => coupon.id);
      this.activated.update((current) => (sameIds(current, ids) ? current : ids));
    } catch {
      // Si falla se queda vacío. Es preferible ofrecer «activar» sobre algo ya
      // activado que decir «ya está» sobre algo que el servidor no tiene.
    }
  }
}

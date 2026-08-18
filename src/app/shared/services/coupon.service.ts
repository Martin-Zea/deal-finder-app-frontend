import { Injectable, effect, inject, signal } from '@angular/core';
import { CouponDetail, CouponSummary } from '../models/coupon';
import { Store } from '../models/store';
import { AuthService } from './auth.service';

const ACTIVATED_KEY = 'ahorra.activated';

const KROGER_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/8/8a/Kroger_logo_%282019%29.svg';
const TARGET_LOGO =
  'https://www.logo.wine/a/logo/Target_Corporation/Target_Corporation-Logo.wine.svg';

// Las dos primeras son las que el mock considera vinculadas a la cuenta.
const MOCK_STORES: readonly Omit<Store, 'isLinked'>[] = [
  { id: 'kroger', name: 'Kroger', logoUrl: KROGER_LOGO },
  { id: 'target', name: 'Target', logoUrl: TARGET_LOGO },
  { id: 'walmart', name: 'Walmart', logoUrl: null },
  { id: 'costco', name: 'Costco', logoUrl: null },
  { id: 'best-buy', name: 'Best Buy', logoUrl: null },
];

const LINKED_STORE_IDS: readonly string[] = ['kroger', 'target'];

// Datos de mentira mientras no hay backend. Están acá y no en las plantillas
// para que el día que exista la API solo cambie el cuerpo de estos métodos.
const MOCK_COUPONS: readonly CouponDetail[] = [
  {
    id: '1',
    storeId: 'kroger',
    title: 'Deal alert',
    description: 'Dove Bar Soap Packs, as Low as $3 Each',
    imageUrl: KROGER_LOGO,
    storeName: 'Kroger',
    storeLogoUrl: KROGER_LOGO,
    savingsLabel: 'Ahorrás $7.00',
    expiresLabel: 'Vence en 3 días',
    expiresSoon: true,
    terms: [
      'Válido solo con tarjeta Kroger Plus registrada en la app.',
      'Un cupón por cliente y por transacción.',
      'No acumulable con otras promociones de la misma marca.',
    ],
    products: [
      'Dove Beauty Bar 4 unidades',
      'Dove Beauty Bar Sensitive 6 unidades',
      'Dove Men+Care Bar 4 unidades',
    ],
  },
  {
    id: '2',
    storeId: 'walmart',
    title: 'Cupón digital',
    description: '20% de descuento en toda la sección de limpieza durante el fin de semana',
    imageUrl: null,
    storeName: 'Walmart',
    storeLogoUrl: null,
    savingsLabel: 'Ahorrás 20%',
    expiresLabel: 'Vence el 12 de abril',
    expiresSoon: false,
    terms: ['Válido sábado y domingo.', 'Compra mínima de $25 en la sección participante.'],
    products: [],
  },
  {
    id: '3',
    storeId: 'target',
    title: 'Solo hoy',
    description: 'Pampers Swaddlers, $4.00 de descuento en packs grandes',
    imageUrl: TARGET_LOGO,
    storeName: 'Target',
    storeLogoUrl: TARGET_LOGO,
    savingsLabel: 'Ahorrás $4.00',
    expiresLabel: 'Vence hoy',
    expiresSoon: true,
    terms: ['Válido con Target Circle.', 'Hasta agotar stock.'],
    products: ['Pampers Swaddlers talle 3', 'Pampers Swaddlers talle 4'],
  },
  {
    id: '4',
    storeId: 'kroger',
    title: 'Cupón digital',
    description: 'All Liquid Laundry Detergent, $7.00 de descuento llevando 2',
    imageUrl: KROGER_LOGO,
    storeName: 'Kroger',
    storeLogoUrl: KROGER_LOGO,
    savingsLabel: 'Ahorrás $7.00',
    expiresLabel: 'Vence en 6 días',
    expiresSoon: false,
    terms: ['Llevando dos unidades.', 'Válido solo con tarjeta registrada.'],
    products: ['All OXI 88 oz', 'All Free Clear 88 oz'],
  },
  {
    id: '5',
    storeId: 'costco',
    title: 'Miembros',
    description: 'Kirkland Signature Café, $5.00 de descuento en la bolsa de 1.3 kg',
    imageUrl: null,
    storeName: 'Costco',
    storeLogoUrl: null,
    savingsLabel: 'Ahorrás $5.00',
    expiresLabel: 'Vence el 30 de abril',
    expiresSoon: false,
    terms: ['Exclusivo para socios.', 'Máximo 4 unidades por socio.'],
    products: [],
  },
  {
    id: '6',
    storeId: 'best-buy',
    title: 'Liquidación',
    description: 'Auriculares Sony WH-CH520 con 25% de descuento',
    imageUrl: null,
    storeName: 'Best Buy',
    storeLogoUrl: null,
    savingsLabel: 'Ahorrás 25%',
    expiresLabel: 'Vence en 2 días',
    expiresSoon: true,
    terms: ['Solo unidades en tienda.', 'No aplica a compras online.'],
    products: [],
  },
];

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly auth = inject(AuthService);

  // Interruptor de demo: con esto en true la próxima carga falla, así los
  // estados de error se pueden ver desde el catálogo sin desconectar nada. Se
  // va junto con el mock cuando entre la API.
  readonly failNextRequest = signal(false);

  private readonly activated = signal<readonly string[]>(readActivated());
  readonly activatedIds = this.activated.asReadonly();

  private readonly latencyMs = 900;

  constructor() {
    // Los cupones activados cuelgan de la cuenta: al cerrar sesión dejan de ser
    // de nadie. Con la API real esto lo resolvería el backend, pero mientras el
    // estado viva en el navegador hay que limpiarlo a mano.
    effect(() => {
      if (!this.auth.isSignedIn()) {
        this.activated.set([]);
        localStorage.removeItem(ACTIVATED_KEY);
      }
    });
  }

  stores(): Promise<readonly Store[]> {
    return this.respond(() =>
      MOCK_STORES.map((store) => ({
        ...store,
        isLinked: this.auth.isSignedIn() && LINKED_STORE_IDS.includes(store.id),
      })),
    );
  }

  // Los dos filtros van juntos en un solo método porque en la API van a ser dos
  // query params del mismo endpoint, no dos endpoints.
  list(params: { storeId: string | null; query: string }): Promise<readonly CouponSummary[]> {
    const query = params.query.trim().toLowerCase();

    return this.respond(() =>
      MOCK_COUPONS.filter((coupon) => {
        if (params.storeId && coupon.storeId !== params.storeId) return false;
        if (!query) return true;

        return (
          coupon.title.toLowerCase().includes(query) ||
          coupon.description.toLowerCase().includes(query) ||
          coupon.storeName.toLowerCase().includes(query)
        );
      }).map(toSummary),
    );
  }

  myCoupons(): Promise<readonly CouponSummary[]> {
    return this.respond(() =>
      MOCK_COUPONS.filter((coupon) => this.activated().includes(coupon.id)).map(toSummary),
    );
  }

  detail(id: string): Promise<CouponDetail> {
    return this.respond(() => {
      const found = MOCK_COUPONS.find((coupon) => coupon.id === id);
      if (!found) throw new Error(`El cupón ${id} no existe.`);

      return found;
    });
  }

  // Activar un cupón es un POST contra la tarjeta de la tienda. Acá solo
  // consume tiempo, pero le da al botón un estado de carga real que probar.
  async activate(id: string): Promise<void> {
    await this.respond(() => undefined);

    this.activated.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
    localStorage.setItem(ACTIVATED_KEY, JSON.stringify(this.activated()));
  }

  isActivated(id: string): boolean {
    return this.activated().includes(id);
  }

  // Un solo lugar donde vive la latencia y el interruptor de fallas, para que
  // los seis métodos se comporten igual y no haya uno que se olvide de fallar.
  private respond<T>(produce: () => T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        if (this.failNextRequest()) {
          reject(new Error('No se pudo contactar al servidor de cupones.'));
          return;
        }

        try {
          resolve(produce());
        } catch (error) {
          reject(error);
        }
      }, this.latencyMs);
    });
  }
}

function toSummary(coupon: CouponDetail): CouponSummary {
  return {
    id: coupon.id,
    storeId: coupon.storeId,
    title: coupon.title,
    description: coupon.description,
    imageUrl: coupon.imageUrl,
  };
}

function readActivated(): readonly string[] {
  try {
    const raw = localStorage.getItem(ACTIVATED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

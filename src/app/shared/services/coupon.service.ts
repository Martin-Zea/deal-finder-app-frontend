import { Injectable, signal } from '@angular/core';
import { CouponDetail } from '../models/coupon';

// Datos de mentira mientras no hay backend. Están acá y no en la plantilla para
// que el día que exista la API solo cambie el cuerpo de detail().
const MOCK_COUPONS: readonly CouponDetail[] = [
  {
    id: '1',
    title: 'Deal alert',
    description: 'Dove Bar Soap Packs, as Low as $3 Each',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Kroger_logo_%282019%29.svg',
    storeName: 'Kroger',
    storeLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Kroger_logo_%282019%29.svg',
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
];

@Injectable({ providedIn: 'root' })
export class CouponService {
  // Interruptor de demo: con esto en true la próxima carga falla, así el estado
  // de error se puede ver desde el catálogo sin desconectar nada. Se va junto
  // con el mock cuando entre la API.
  readonly failNextRequest = signal(false);

  private readonly latencyMs = 900;

  detail(id: string): Promise<CouponDetail> {
    return new Promise((resolve, reject) => {
      // La latencia no es decorativa: sin ella el skeleton nunca se ve y no hay
      // forma de saber si la silueta calza con el contenido real.
      setTimeout(() => {
        if (this.failNextRequest()) {
          reject(new Error('No se pudo contactar al servidor de cupones.'));
          return;
        }

        const found = MOCK_COUPONS.find((coupon) => coupon.id === id);
        if (!found) {
          reject(new Error(`El cupón ${id} no existe.`));
          return;
        }

        resolve(found);
      }, this.latencyMs);
    });
  }

  // Activar un cupón es un POST contra la tarjeta de la tienda. Acá solo
  // consume tiempo, pero le da al botón un estado de carga real que probar.
  activate(id: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }
}

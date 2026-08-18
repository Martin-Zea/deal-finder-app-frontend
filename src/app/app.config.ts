import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding entrega los parámetros de ruta como input():
    // es lo que deja que CouponDetailPage reciba el id sin inyectar
    // ActivatedRoute ni suscribirse a un observable.
    provideRouter(
      routes,
      withComponentInputBinding(),
      // La otra mitad de que «atrás» funcione: sin esto el router deja la
      // página donde estaba y volver de un cupón te tira al encabezado de la
      // lista, aunque el cupón estuviera décimo.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    // Todavía no lo usa nadie —los datos salen de un mock—, pero es el
    // proveedor que necesita httpResource() el día que exista la API, y sin él
    // el reemplazo falla en runtime en vez de en compilación.
    provideHttpClient(),
  ],
};

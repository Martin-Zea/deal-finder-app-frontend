import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './shared/services/auth.interceptor';

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
    // El interceptor adjunta el token en cada request. Va acá y no en cada
    // servicio para que ninguno pueda olvidarse: el día que se agregue un
    // servicio nuevo, la sesión ya viaja sola.
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};

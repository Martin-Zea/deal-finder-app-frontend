import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStore } from './token-store';

// Funcional y no una clase: es la forma que espera withInterceptors(), y así el
// token se adjunta en un solo lugar en vez de en cada método de cada servicio.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStore).token();

  // Sin sesión la request sale igual y no se cancela: /stores y /coupons
  // responden sin cuenta, solo que con menos datos.
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

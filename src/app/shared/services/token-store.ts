import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'ahorra.token';

// Vive separado de AuthService a propósito. El interceptor necesita el token en
// cada request, y si se lo pidiera a AuthService —que a su vez usa HttpClient—
// quedaría un ciclo entre el cliente HTTP y el servicio que lo consume. Acá no
// hay nada inyectado, así que el ciclo no existe.
@Injectable({ providedIn: 'root' })
export class TokenStore {
  private readonly current = signal<string | null>(readStoredToken());
  readonly token = this.current.asReadonly();

  set(token: string): void {
    this.current.set(token);

    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Un storage bloqueado no puede tumbar el login: la sesión sigue viva en
      // memoria y solo se pierde al recargar la página.
    }
  }

  clear(): void {
    this.current.set(null);

    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Si no se puede borrar, el signal en null ya alcanza para que nadie más
      // lo use en esta sesión.
    }
  }
}

// Fuera de la clase porque corre antes de que exista la instancia: es el estado
// inicial del signal, no un método.
function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import { TokenStore } from './token-store';

const STORAGE_KEY = 'ahorra.session';

// Lo que devuelve POST /auth/google. No es un modelo del dominio: el token es un
// detalle del transporte y ninguna pantalla lo ve.
interface SessionResponse {
  readonly token: string;
  readonly user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenStore);

  // El usuario guardado se toma como bueno para pintar la primera pantalla sin
  // esperar a la red; validateSession() lo confirma o lo desmiente después.
  private readonly currentUser = signal<User | null>(readStoredUser());

  readonly user = this.currentUser.asReadonly();
  readonly isSignedIn = computed(() => this.currentUser() !== null);

  // La hoja de login no es una ruta: es un estado de la app que cualquier
  // pantalla puede pedir. Por eso vive acá y no en una página.
  private readonly promptVisible = signal(false);
  readonly promptOpen = this.promptVisible.asReadonly();

  private readonly busy = signal(false);
  readonly signingIn = this.busy.asReadonly();

  // Antes el login no podía fallar. Ahora sale a la red, así que el fallo tiene
  // que llegar a la pantalla: dejar la hoja abierta con el botón apagado y sin
  // decir nada parece que el toque no se registró.
  private readonly signInFailed = signal(false);
  readonly signInError = this.signInFailed.asReadonly();

  // Lo que el usuario quería hacer cuando le pedimos la cuenta. Se guarda para
  // ejecutarlo al volver: mandarlo a loguearse y devolverlo con las manos
  // vacías obliga a repetir el gesto y es donde se pierde la conversión.
  private pendingAction: (() => void) | null = null;

  constructor() {
    if (this.currentUser() !== null) void this.validateSession();
  }

  requestSignIn(pendingAction?: () => void): void {
    if (this.isSignedIn()) {
      pendingAction?.();
      return;
    }

    this.pendingAction = pendingAction ?? null;
    this.signInFailed.set(false);
    this.promptVisible.set(true);
  }

  dismissPrompt(): void {
    this.promptVisible.set(false);
    this.signInFailed.set(false);
    this.pendingAction = null;
  }

  async signInWithGoogle(): Promise<void> {
    this.busy.set(true);
    this.signInFailed.set(false);

    try {
      const session = await firstValueFrom(
        this.http.post<SessionResponse>(`${environment.apiBaseUrl}/auth/google`, {
          // Pendiente: esto tiene que ser el ID token que devuelve Google
          // Identity Services. Hasta que exista el client_id, el backend acepta
          // cualquier string y responde siempre el mismo usuario. El día que
          // entre GIS cambia de dónde sale este valor y nada más del método.
          idToken: 'pendiente-de-google-identity-services',
        }),
      );

      this.tokens.set(session.token);
      this.currentUser.set(session.user);
      writeStoredUser(session.user);
      this.promptVisible.set(false);

      const action = this.pendingAction;
      this.pendingAction = null;
      action?.();
    } catch {
      // Se traga acá y se cuenta con un signal: la plantilla llama a este método
      // directo desde un (pressed), así que una promesa rechazada no tendría a
      // nadie que la agarre.
      this.signInFailed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  signOut(): void {
    this.currentUser.set(null);
    this.tokens.clear();

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ya está fuera de memoria; que el storage no coopere no cambia nada.
    }
  }

  // Confirma contra el servidor que la sesión guardada sigue viva. Enterarse
  // acá es mejor que enterarse con el primer 401 en el medio de una pantalla.
  private async validateSession(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${environment.apiBaseUrl}/auth/me`),
      );

      this.currentUser.set(user);
      writeStoredUser(user);
    } catch (error) {
      // Solo se cierra la sesión si el servidor dijo que el token no vale. Si la
      // API está caída, echar al usuario sería castigarlo por una falla nuestra.
      if (error instanceof HttpErrorResponse && error.status === 401) this.signOut();
    }
  }
}

// Fuera de la clase porque corre antes de que exista la instancia: es el estado
// inicial del signal, no un método.
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    // Un localStorage corrupto o bloqueado no puede tumbar el arranque de la
    // app: se trata como "no hay sesión".
    return null;
  }
}

function writeStoredUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // La sesión vive igual en memoria hasta que se recargue la página.
  }
}

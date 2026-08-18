import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user';

const STORAGE_KEY = 'ahorra.session';

// Usuario de mentira hasta que exista el client_id de Google y el endpoint que
// canjea su ID token por una sesión nuestra.
const MOCK_USER: User = {
  id: 'u1',
  name: 'Martín Zea',
  email: 'email@gmail.com',
  avatarUrl: null,
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(readStoredUser());

  readonly user = this.currentUser.asReadonly();
  readonly isSignedIn = computed(() => this.currentUser() !== null);

  // La hoja de login no es una ruta: es un estado de la app que cualquier
  // pantalla puede pedir. Por eso vive acá y no en una página.
  private readonly promptVisible = signal(false);
  readonly promptOpen = this.promptVisible.asReadonly();

  private readonly busy = signal(false);
  readonly signingIn = this.busy.asReadonly();

  // Lo que el usuario quería hacer cuando le pedimos la cuenta. Se guarda para
  // ejecutarlo al volver: mandarlo a loguearse y devolverlo con las manos
  // vacías obliga a repetir el gesto y es donde se pierde la conversión.
  private pendingAction: (() => void) | null = null;

  requestSignIn(pendingAction?: () => void): void {
    if (this.isSignedIn()) {
      pendingAction?.();
      return;
    }

    this.pendingAction = pendingAction ?? null;
    this.promptVisible.set(true);
  }

  dismissPrompt(): void {
    this.promptVisible.set(false);
    this.pendingAction = null;
  }

  // La firma es la definitiva. Cuando exista la API, adentro va: pedirle el ID
  // token a Google Identity Services, mandarlo a POST /auth/google y guardar la
  // sesión que devuelva. Lo de afuera no cambia.
  async signInWithGoogle(): Promise<void> {
    this.busy.set(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      this.currentUser.set(MOCK_USER);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER));
      this.promptVisible.set(false);

      const action = this.pendingAction;
      this.pendingAction = null;
      action?.();
    } finally {
      this.busy.set(false);
    }
  }

  signOut(): void {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
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

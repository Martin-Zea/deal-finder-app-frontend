import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-app-bar',
  imports: [],
  templateUrl: './app-bar.html',
  styleUrl: './app-bar.scss',
})
export class AppBar {
  readonly brandName = input('Ahorra');

  // Igual que en Card: si no hay logo, cae a una marca dibujada con los tokens
  // en vez de dejar un hueco.
  readonly logoUrl = input<string | null>(null);

  // Las acciones son opcionales una por una porque la barra no es la misma en
  // todas las pantallas: la home no lleva hamburguesa ni lupa, el listado sí.
  readonly showMenu = input(false);
  readonly showSearch = input(false);
  readonly showNotifications = input(false);
  readonly notificationCount = input(0);

  readonly menuClick = output<void>();
  readonly searchClick = output<void>();
  readonly notificationsClick = output<void>();

  protected readonly hasBadge = computed(() => this.notificationCount() > 0);

  // Tres dígitos rompen el círculo del badge, así que a partir de 100 se corta.
  protected readonly badgeLabel = computed(() =>
    this.notificationCount() > 99 ? '99+' : String(this.notificationCount()),
  );

  protected readonly notificationsLabel = computed(() =>
    this.hasBadge() ? `Notificaciones, ${this.notificationCount()} sin leer` : 'Notificaciones',
  );

  // La inicial es el reemplazo del logo cuando no hay imagen.
  protected readonly initial = computed(() => this.brandName().trim().charAt(0).toUpperCase());
}

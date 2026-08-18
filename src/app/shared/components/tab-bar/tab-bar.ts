import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// El icono va como nombre y no como svg proyectado: son tres, no cambian, y
// pasarlos por content-projection obligaría a cada pantalla a repetir los
// mismos trazos.
export type TabIcon = 'home' | 'ticket' | 'user';

export interface TabItem {
  readonly label: string;
  readonly link: string;
  readonly icon: TabIcon;

  // La pestaña de inicio apunta a '' y coincidiría con todas las rutas hijas si
  // no se marcara exacta.
  readonly exact?: boolean;
}

@Component({
  selector: 'app-tab-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.scss',
})
export class TabBar {
  readonly tabs = input<readonly TabItem[]>([]);
}

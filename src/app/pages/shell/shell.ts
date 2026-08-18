import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabBar, TabItem } from '../../shared/components/tab-bar/tab-bar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TabBar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  // Las tres pestañas viven acá y no adentro de app-tab-bar: el componente no
  // tiene por qué saber cómo se llaman las rutas de esta app.
  protected readonly tabs: readonly TabItem[] = [
    { label: 'Inicio', link: '/', icon: 'home', exact: true },
    { label: 'Mis cupones', link: '/mis-cupones', icon: 'ticket' },
    { label: 'Perfil', link: '/perfil', icon: 'user' },
  ];
}

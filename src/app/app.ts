import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomSheet } from './shared/components/bottom-sheet/bottom-sheet';
import { Button } from './shared/components/button/button';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomSheet, Button],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // La hoja de login vive en la raíz y no en una página: se abre desde el
  // detalle, desde una pestaña y desde el perfil, y ninguna de esas tres es
  // padre de las otras. Acá arriba está por encima de todas.
  protected readonly auth = inject(AuthService);
}

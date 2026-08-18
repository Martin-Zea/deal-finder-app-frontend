import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageBox } from '../image/image';

@Component({
  selector: 'app-store-pill',
  imports: [RouterLink, ImageBox],
  templateUrl: './store-pill.html',
  styleUrl: './store-pill.scss',
})
export class StorePill {
  readonly storeName = input('');
  readonly logoUrl = input<string | null>(null);

  // Sin link la píldora es solo información. Es la diferencia entre "esta
  // oferta es de Kroger" y "tocá para ver todo lo de Kroger", y cambia el
  // elemento que se dibuja: <a> o <span>.
  readonly link = input<string | null>(null);
}

import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coupon',
  imports: [RouterLink],
  templateUrl: './coupon.html',
  styleUrl: './coupon.scss',
})
export class Coupon {
  readonly imageUrl = input<string | null>(null);
  readonly title = input('');
  readonly description = input('');

  // Ruta interna a la que navega la tarjeta completa, ej. '/cupon/123'.
  readonly link = input('/');
}

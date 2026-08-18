import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Skeleton } from '../skeleton/skeleton';

@Component({
  selector: 'app-coupon',
  imports: [RouterLink, Skeleton],
  templateUrl: './coupon.html',
  styleUrl: './coupon.scss',
})
export class Coupon {
  readonly imageUrl = input<string | null>(null);
  readonly title = input('');
  readonly description = input('');

  // Ruta interna a la que navega la tarjeta completa, ej. '/cupon/123'.
  readonly link = input('/');

  // La silueta de carga vive acá adentro y no en un `app-coupon-skeleton`
  // aparte: comparte las mismas clases que el contenido real, así que no puede
  // quedar desalineada cuando alguien toque un padding de coupon.scss.
  readonly loading = input(false);
}

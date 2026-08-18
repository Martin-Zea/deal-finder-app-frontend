import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-coupon-clip',
  imports: [],
  templateUrl: './coupon-clip.html',
  styleUrl: './coupon-clip.scss',
})
export class CouponClip {
  readonly imageUrl = input<string | null>(null);
  readonly productName = input('');

  // "$7.00 / 1" son dos datos distintos: el monto de descuento y cuántas
  // unidades hay que llevar para que aplique.
  readonly amount = input('');
  readonly quantity = input(1);

  // El vencimiento llega ya formateado. Todavía no hay capa de datos ni locale
  // configurado, así que formatear una fecha acá sería inventar una decisión
  // que le corresponde a quien traiga los datos.
  readonly expiresOn = input('');

  // Componente controlado. Que un cupón esté activado es estado de negocio —
  // vive en el backend, cargado contra la tarjeta de la tienda — así que lo
  // sostiene el padre. El par active/activeChange habilita [(active)] sin que
  // este componente guarde nada propio.
  readonly active = input(false);
  readonly activeChange = output<boolean>();

  // Fila destacada: la que la app resalta por encima del resto de la lista.
  readonly highlighted = input(false);

  protected toggle(): void {
    this.activeChange.emit(!this.active());
  }
}

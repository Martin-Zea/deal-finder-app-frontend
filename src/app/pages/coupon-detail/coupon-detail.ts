import { Location } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { AppBar } from '../../shared/components/app-bar/app-bar';
import { Badge } from '../../shared/components/badge/badge';
import { Button } from '../../shared/components/button/button';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { ImageBox } from '../../shared/components/image/image';
import { Section } from '../../shared/components/section/section';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { StorePill } from '../../shared/components/store-pill/store-pill';
import { AuthService } from '../../shared/services/auth.service';
import { CouponService } from '../../shared/services/coupon.service';

@Component({
  selector: 'app-coupon-detail-page',
  imports: [AppBar, Badge, Button, ErrorState, ImageBox, Section, Skeleton, StorePill],
  templateUrl: './coupon-detail.html',
  styleUrl: './coupon-detail.scss',
})
export class CouponDetailPage {
  // Llega desde la ruta gracias a withComponentInputBinding(), así que la
  // página no inyecta ActivatedRoute ni se suscribe a nada.
  readonly id = input.required<string>();

  private readonly coupons = inject(CouponService);
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);

  // resource() vuelve a pedir solo cuando cambia params: navegar de /cupon/1 a
  // /cupon/2 recarga sin que nadie escriba un efecto.
  protected readonly detail = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => this.coupons.detail(params.id),
  });

  // Mientras carga, la barra no puede mostrar el título del cupón porque
  // todavía no existe. Un genérico corto es mejor que una barra vacía que
  // después empuja el layout.
  //
  // hasValue() y no value() a secas: cuando el resource está en error, value()
  // lanza. Y como esto se pinta en la barra —fuera del @if que cubre el resto de
  // la pantalla— esa excepción rompía la detección de cambios antes de llegar a
  // la rama de error, y el detalle se quedaba en siluetas para siempre en vez de
  // ofrecer «Reintentar».
  protected readonly headingText = computed(() =>
    this.detail.hasValue() ? this.detail.value().title : 'Cupón',
  );

  protected readonly activating = signal(false);

  // Sin toast todavía, el fallo de la activación se cuenta al lado del botón:
  // dejar la promesa sin catch hacía que el error se perdiera y el usuario
  // viera el botón volver a su estado inicial sin explicación.
  protected readonly activationFailed = signal(false);

  // El estado de activado vive en el servicio y no acá: al volver a esta
  // pantalla desde «Mis cupones» tiene que seguir diciendo lo mismo.
  protected readonly activated = computed(() => this.coupons.activatedIds().includes(this.id()));

  protected goBack(): void {
    this.location.back();
  }

  // Sin sesión no se activa nada, pero tampoco se pierde el gesto: el servicio
  // guarda esta misma función y la ejecuta cuando el login termina bien.
  protected onActivate(): void {
    this.auth.requestSignIn(() => void this.activate());
  }

  private async activate(): Promise<void> {
    this.activating.set(true);
    this.activationFailed.set(false);

    try {
      await this.coupons.activate(this.id());
    } catch {
      this.activationFailed.set(true);
    } finally {
      this.activating.set(false);
    }
  }
}

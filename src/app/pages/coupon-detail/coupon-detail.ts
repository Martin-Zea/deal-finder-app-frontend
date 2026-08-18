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

  // resource() vuelve a pedir solo cuando cambia params: navegar de /cupon/1 a
  // /cupon/2 recarga sin que nadie escriba un efecto.
  protected readonly detail = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => this.coupons.detail(params.id),
  });

  // Mientras carga, la barra no puede mostrar el título del cupón porque
  // todavía no existe. Un genérico corto es mejor que una barra vacía que
  // después empuja el layout.
  protected readonly headingText = computed(() => this.detail.value()?.title ?? 'Cupón');

  protected readonly activating = signal(false);
  protected readonly activated = signal(false);

  protected goBack(): void {
    this.location.back();
  }

  protected async activate(): Promise<void> {
    this.activating.set(true);

    try {
      await this.coupons.activate(this.id());
      this.activated.set(true);
    } finally {
      this.activating.set(false);
    }
  }
}

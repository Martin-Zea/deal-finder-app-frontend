import { Component, inject, resource } from '@angular/core';
import { AppBar } from '../../shared/components/app-bar/app-bar';
import { Button } from '../../shared/components/button/button';
import { Coupon } from '../../shared/components/coupon/coupon';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { AuthService } from '../../shared/services/auth.service';
import { CouponService } from '../../shared/services/coupon.service';

@Component({
  selector: 'app-my-coupons-page',
  imports: [AppBar, Button, Coupon, EmptyState, ErrorState],
  templateUrl: './my-coupons.html',
  styleUrl: './my-coupons.scss',
})
export class MyCouponsPage {
  private readonly coupons = inject(CouponService);
  protected readonly auth = inject(AuthService);

  // activatedIds entra en params para que activar un cupón desde el detalle se
  // vea acá al volver, sin recargar la pestaña a mano.
  protected readonly mine = resource({
    params: () => ({
      signedIn: this.auth.isSignedIn(),
      activated: this.coupons.activatedIds(),
    }),
    loader: ({ params }) => (params.signedIn ? this.coupons.myCoupons() : Promise.resolve([])),
  });

  protected readonly skeletonRows = [0, 1];

  protected signIn(): void {
    this.auth.requestSignIn();
  }
}

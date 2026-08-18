import { Component, computed, inject, resource } from '@angular/core';
import { AppBar } from '../../shared/components/app-bar/app-bar';
import { Button } from '../../shared/components/button/button';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ImageBox } from '../../shared/components/image/image';
import { Section } from '../../shared/components/section/section';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { StorePill } from '../../shared/components/store-pill/store-pill';
import { AuthService } from '../../shared/services/auth.service';
import { CouponService } from '../../shared/services/coupon.service';

@Component({
  selector: 'app-profile-page',
  imports: [AppBar, Button, EmptyState, ImageBox, Section, Skeleton, StorePill],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfilePage {
  private readonly coupons = inject(CouponService);
  protected readonly auth = inject(AuthService);

  protected readonly stores = resource({
    params: () => ({ signedIn: this.auth.isSignedIn() }),
    loader: () => this.coupons.stores(),
  });

  protected readonly linkedStores = computed(() =>
    (this.stores.value() ?? []).filter((store) => store.isLinked),
  );

  protected readonly initial = computed(() =>
    (this.auth.user()?.name ?? '').trim().charAt(0).toUpperCase(),
  );

  protected signIn(): void {
    this.auth.requestSignIn();
  }

  protected signOut(): void {
    this.auth.signOut();
  }
}

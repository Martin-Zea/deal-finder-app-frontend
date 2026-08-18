import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppBar } from '../../shared/components/app-bar/app-bar';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';
import { Coupon } from '../../shared/components/coupon/coupon';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { SearchBar } from '../../shared/components/search-bar/search-bar';
import { Section } from '../../shared/components/section/section';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { AuthService } from '../../shared/services/auth.service';
import { CouponService } from '../../shared/services/coupon.service';

@Component({
  selector: 'app-home-page',
  imports: [AppBar, Button, Card, Coupon, EmptyState, ErrorState, SearchBar, Section, Skeleton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  private readonly coupons = inject(CouponService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly query = signal('');
  protected readonly selectedStore = signal<string | null>(null);

  // Depende de la sesión porque el "vinculada" de cada tienda sale de la
  // cuenta: al entrar o salir, la fila se vuelve a pedir sola.
  protected readonly stores = resource({
    params: () => ({ signedIn: this.auth.isSignedIn() }),
    loader: () => this.coupons.stores(),
  });

  // Los dos filtros están en params, así que tocar una tienda o buscar dispara
  // una carga nueva sin un solo efecto escrito a mano.
  protected readonly feed = resource({
    params: () => ({ storeId: this.selectedStore(), query: this.query() }),
    loader: ({ params }) => this.coupons.list(params),
  });

  protected readonly hasFilters = computed(
    () => this.selectedStore() !== null || this.query() !== '',
  );

  protected readonly avatarInitial = computed(() =>
    (this.auth.user()?.name ?? '').trim().charAt(0).toUpperCase(),
  );

  // Tres filas de silueta: suficientes para llenar el alto visible sin fingir
  // que sabemos cuántos cupones va a devolver el servidor.
  protected readonly skeletonRows = [0, 1, 2];

  protected toggleStore(id: string): void {
    this.selectedStore.update((current) => (current === id ? null : id));
  }

  protected clearFilters(): void {
    this.selectedStore.set(null);
    this.query.set('');
  }

  protected signIn(): void {
    this.auth.requestSignIn();
  }

  protected goToProfile(): void {
    this.router.navigate(['/perfil']);
  }
}

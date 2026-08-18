import { Component, computed, inject, input, resource } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
  // Los filtros viven en la URL y no en signals locales: al abrir un cupón esta
  // página se destruye, y con el estado adentro volvía siempre en blanco. En la
  // URL sobreviven al «atrás», al refresh, y se pueden compartir por link.
  //
  // Llegan como input() gracias a withComponentInputBinding(), el mismo
  // mecanismo que le da el :id al detalle. Aceptan undefined porque el router
  // limpia el input cuando el parámetro desaparece de la URL.
  readonly q = input<string | undefined>('');
  readonly tienda = input<string | undefined>(undefined);

  private readonly coupons = inject(CouponService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);

  protected readonly query = computed(() => this.q() ?? '');
  protected readonly selectedStore = computed(() => this.tienda() ?? null);

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

  protected search(term: string): void {
    this.setFilters({ q: term || null });
  }

  protected toggleStore(id: string): void {
    this.setFilters({ tienda: this.selectedStore() === id ? null : id });
  }

  protected clearFilters(): void {
    this.setFilters({ q: null, tienda: null });
  }

  protected signIn(): void {
    this.auth.requestSignIn();
  }

  protected goToProfile(): void {
    this.router.navigate(['/perfil']);
  }

  // null borra el parámetro de la URL en vez de dejarlo vacío, así una home sin
  // filtros vuelve a ser '/' limpio.
  //
  // replaceUrl porque cada cambio de filtro no es un lugar al que volver: sin
  // esto, «atrás» te hace desandar búsqueda por búsqueda en vez de salir de la
  // pantalla, que es lo que el usuario espera del botón.
  private setFilters(changes: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: changes,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

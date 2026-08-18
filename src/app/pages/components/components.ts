import { Component, inject, signal } from '@angular/core';
import { AppBar } from '../../shared/components/app-bar/app-bar';
import { Card } from '../../shared/components/card/card';
import { Coupon } from '../../shared/components/coupon/coupon';
import { CouponClip } from '../../shared/components/coupon-clip/coupon-clip';
import { SearchBar } from '../../shared/components/search-bar/search-bar';
import { Badge } from '../../shared/components/badge/badge';
import { Button } from '../../shared/components/button/button';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { ImageBox } from '../../shared/components/image/image';
import { Section } from '../../shared/components/section/section';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { StorePill } from '../../shared/components/store-pill/store-pill';
import { BottomSheet } from '../../shared/components/bottom-sheet/bottom-sheet';
import { TabBar, TabItem } from '../../shared/components/tab-bar/tab-bar';
import { CouponService } from '../../shared/services/coupon.service';

export type ThemeName = 'krazy' | 'punch' | 'organic' | 'money';

interface ThemeOption {
  readonly id: ThemeName;
  readonly label: string;
  readonly hint: string;
}

@Component({
  selector: 'app-components-page',
  imports: [
    AppBar,
    Badge,
    Button,
    Card,
    Coupon,
    CouponClip,
    EmptyState,
    ErrorState,
    ImageBox,
    SearchBar,
    Section,
    Skeleton,
    StorePill,
    BottomSheet,
    TabBar,
  ],
  templateUrl: './components.html',
  styleUrl: './components.scss',
})
export class ComponentsPage {
  protected readonly themes: readonly ThemeOption[] = [
    { id: 'krazy', label: 'Krazy', hint: 'Amarillo / negro' },
    { id: 'punch', label: 'Punch', hint: 'Magenta' },
    { id: 'organic', label: 'Organic', hint: 'Terracota' },
    { id: 'money', label: 'Money', hint: 'Verde azulado' },
  ];

  // Los roles que se ven distintos entre temas. Se muestran como muestras para
  // poder juzgar una paleta sin adivinar qué token está detrás de cada pieza.
  protected readonly roleSwatches: readonly string[] = [
    'brand-surface',
    'primary',
    'surface',
    'surface-container',
    'on-surface',
    'on-surface-variant',
    'outline-variant',
    'savings',
    'urgent',
  ];

  protected readonly theme = signal<ThemeName>('krazy');
  protected readonly lastSearch = signal<string | null>(null);
  protected readonly lastBarAction = signal<string | null>(null);

  // CouponClip es controlado, así que el catálogo hace de padre y sostiene el
  // estado de activación de cada fila.
  protected readonly clipped = signal<Record<string, boolean>>({
    pampers: true,
    detergent: true,
    dove: false,
  });

  protected setTheme(name: ThemeName): void {
    this.theme.set(name);
  }

  // El catálogo es el único lugar donde tiene sentido tocar el interruptor de
  // fallas del servicio: deja ver el estado de error de la pantalla de detalle
  // sin desenchufar nada.
  protected readonly coupons = inject(CouponService);

  protected readonly buttonBusy = signal(false);

  // Las pestañas del catálogo apuntan a las rutas reales: así se ve cuál queda
  // marcada como activa, que es la mitad del componente.
  protected readonly demoTabs: readonly TabItem[] = [
    { label: 'Inicio', link: '/', icon: 'home', exact: true },
    { label: 'Mis cupones', link: '/mis-cupones', icon: 'ticket' },
    { label: 'Perfil', link: '/perfil', icon: 'user' },
  ];

  protected readonly sheetOpen = signal(false);

  protected async runButtonDemo(): Promise<void> {
    this.buttonBusy.set(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    this.buttonBusy.set(false);
  }

  protected toggleApiFailure(): void {
    this.coupons.failNextRequest.update((value) => !value);
  }

  // El interruptor de carga es lo único que hace útil al skeleton en el
  // catálogo: la silueta solo se puede juzgar alternando contra el contenido
  // real y viendo si la lista salta.
  protected readonly couponLoading = signal(false);

  protected toggleCouponLoading(): void {
    this.couponLoading.update((value) => !value);
  }

  protected setClipped(id: string, active: boolean): void {
    this.clipped.update((state) => ({ ...state, [id]: active }));
  }

  protected onBarAction(action: string): void {
    this.lastBarAction.set(action);
  }

  protected onSearch(term: string): void {
    this.lastSearch.set(term);
  }
}

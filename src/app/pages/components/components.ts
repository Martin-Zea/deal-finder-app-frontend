import { Component, signal } from '@angular/core';
import { AppBar } from '../../shared/components/app-bar/app-bar';
import { Card } from '../../shared/components/card/card';
import { Coupon } from '../../shared/components/coupon/coupon';
import { CouponClip } from '../../shared/components/coupon-clip/coupon-clip';
import { SearchBar } from '../../shared/components/search-bar/search-bar';

export type ThemeName = 'krazy' | 'punch' | 'organic' | 'money';

interface ThemeOption {
  readonly id: ThemeName;
  readonly label: string;
  readonly hint: string;
}

@Component({
  selector: 'app-components-page',
  imports: [AppBar, Card, Coupon, CouponClip, SearchBar],
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

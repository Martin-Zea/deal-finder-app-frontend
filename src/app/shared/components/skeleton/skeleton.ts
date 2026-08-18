import { Component, computed, input } from '@angular/core';

// El input nombra un token de styles.scss, no un valor: así un skeleton no
// puede inventar una curva que el resto de los componentes no usa.
export type SkeletonRadius = 'sm' | 'md' | 'lg' | 'pill';

@Component({
  selector: 'app-skeleton',
  imports: [],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
  // Las cajas no tienen nada que decirle a un lector de pantalla. Quien avisa
  // que algo está cargando es el contenedor, con aria-busy.
  host: { 'aria-hidden': 'true' },
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly radius = input<SkeletonRadius>('sm');

  // Más de una línea dibuja un bloque de texto. La última sale más corta
  // porque los párrafos reales tampoco terminan justos contra el margen.
  readonly lines = input(1);

  protected readonly lineWidths = computed<readonly string[]>(() => {
    const count = Math.max(1, this.lines());
    if (count === 1) return [this.width()];

    return Array.from({ length: count }, (_, index) =>
      index === count - 1 ? '60%' : this.width(),
    );
  });

  protected readonly radiusToken = computed(() => `var(--radius-${this.radius()})`);
}

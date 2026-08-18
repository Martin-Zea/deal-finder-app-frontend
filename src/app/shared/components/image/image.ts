import { Component, computed, input, linkedSignal } from '@angular/core';

export type ImageRadius = 'sm' | 'md' | 'lg' | 'pill';

@Component({
  selector: 'app-image',
  imports: [],
  templateUrl: './image.html',
  styleUrl: './image.scss',
})
// No se llama Image porque ese nombre ya es el constructor global del DOM:
// importarlo taparía a window.Image dentro del archivo que lo use.
export class ImageBox {
  readonly src = input<string | null>(null);
  readonly alt = input('');

  // La proporción va como string CSS ('1 / 1', '16 / 9') porque es lo que
  // termina en aspect-ratio: traducirla desde un enum solo agregaría un mapa
  // que hay que ampliar cada vez que aparece una medida nueva.
  readonly ratio = input('1 / 1');
  readonly radius = input<ImageRadius>('md');
  readonly fit = input<'contain' | 'cover'>('cover');

  // Un logo de tienda roto es un caso real y frecuente: no los servimos
  // nosotros. linkedSignal vuelve a false solo cuando cambia el src, así que un
  // error viejo no se queda pegado sobre una imagen nueva.
  protected readonly failed = linkedSignal({
    source: this.src,
    computation: () => false,
  });

  protected readonly showPlaceholder = computed(() => !this.src() || this.failed());

  protected readonly radiusToken = computed(() => `var(--radius-${this.radius()})`);

  protected onError(): void {
    this.failed.set(true);
  }
}

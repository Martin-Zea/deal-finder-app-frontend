import { Component, computed, input, output } from '@angular/core';

// filled es el CTA de la pantalla y usa el color de marca; outlined y text son
// acciones secundarias y solo llevan tinta.
export type ButtonVariant = 'filled' | 'outlined' | 'text';
export type ButtonSize = 'md' | 'lg';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  // El ancho completo tiene que llegar al host: si solo lo tomara el <button>
  // de adentro, el host seguiría midiendo su contenido y el botón no se
  // estiraría dentro de una columna.
  host: { '[class.button--block]': 'fullWidth()' },
  styleUrl: './button.scss',
})
export class Button {
  readonly variant = input<ButtonVariant>('filled');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');

  readonly disabled = input(false);

  // Cargando es distinto de deshabilitado aunque los dos bloqueen el click: el
  // botón sigue diciendo qué está haciendo, y por eso conserva su etiqueta.
  readonly loading = input(false);

  readonly fullWidth = input(false);

  readonly pressed = output<void>();

  protected readonly classes = computed(
    () =>
      `button button--${this.variant()} button--${this.size()}` +
      (this.fullWidth() ? ' button--block' : ''),
  );

  protected readonly isBlocked = computed(() => this.disabled() || this.loading());

  protected onClick(): void {
    if (this.isBlocked()) return;

    this.pressed.emit();
  }
}

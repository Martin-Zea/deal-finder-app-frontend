import { Component, computed, input } from '@angular/core';

// Los tonos son semánticos, no decorativos: savings y urgent significan lo
// mismo en los cuatro temas, así que el usuario no pierde la señal al cambiar
// de identidad. brand sí acompaña al tema.
export type BadgeTone = 'neutral' | 'savings' | 'urgent' | 'brand';

@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
  readonly size = input<'sm' | 'md'>('md');

  protected readonly classes = computed(() => `badge badge--${this.tone()} badge--${this.size()}`);
}

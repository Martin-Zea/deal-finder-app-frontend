import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly heading = input('');
  readonly message = input('');

  // urgent tiñe solo el icono. El texto se queda en la tinta normal porque un
  // párrafo entero en rojo se lee como una alarma, no como una explicación.
  readonly tone = input<'neutral' | 'urgent'>('neutral');

  protected readonly classes = computed(() => `empty-state empty-state--${this.tone()}`);
}

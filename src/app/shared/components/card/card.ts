import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  readonly logoUrl = input<string | null>(null);
  readonly storeName = input('Tienda');
  readonly isLinked = input(true);
}

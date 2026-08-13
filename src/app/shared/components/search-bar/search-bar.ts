import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  readonly placeholder = input('Buscar oferta, marca o tienda');

  protected readonly query = signal('');

  readonly searchSubmit = output<string>();

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const value = this.query().trim();
    if (!value) return;

    this.searchSubmit.emit(value);
  }
}

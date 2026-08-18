import { Component, input, linkedSignal, output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  readonly placeholder = input('Buscar oferta, marca o tienda');

  // El valor puede venir de afuera para poder limpiarlo desde la pantalla: sin
  // esto, borrar el filtro dejaba el texto viejo escrito en el input.
  // linkedSignal deja escribir localmente y se resetea cuando cambia el input.
  readonly value = input('');

  protected readonly query = linkedSignal(() => this.value());

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

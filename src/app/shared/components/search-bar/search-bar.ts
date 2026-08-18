import { Component, ElementRef, input, linkedSignal, output, viewChild } from '@angular/core';

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

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);

    // Vaciar el campo —con la ✕ nativa de type="search" o borrando a mano—
    // devuelve la lista completa sin pedir otro envío. Sin esto el usuario
    // quedaba filtrado con el campo en blanco y sin nada que tocar para salir.
    if (text === '') this.searchSubmit.emit('');
  }

  protected clear(): void {
    this.query.set('');
    this.searchSubmit.emit('');

    // El foco vuelve al campo en vez de quedar en un botón que ya desapareció:
    // quien limpia la búsqueda casi siempre quiere escribir otra, y en el
    // celular esto mantiene el teclado abierto.
    this.field()?.nativeElement.focus();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    // Emite siempre, incluso vacío: buscar "" es una búsqueda válida —significa
    // "mostrame todo"— y era la única forma de volver atrás.
    this.searchSubmit.emit(this.query().trim());

    // En el celular el teclado tapa media pantalla. Sin esto, el usuario busca
    // y no ve ni un resultado hasta que toca fuera del campo.
    this.field()?.nativeElement.blur();
  }
}

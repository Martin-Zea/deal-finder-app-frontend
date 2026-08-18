import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section',
  imports: [],
  templateUrl: './section.html',
  styleUrl: './section.scss',
})
export class Section {
  readonly heading = input('');

  // El nivel es un input porque el mismo bloque sirve de sección de página (h2)
  // y de subsección dentro de otra (h3): fijarlo en h2 obligaría a repetir el
  // componente para no romper el orden de encabezados.
  readonly level = input<2 | 3>(2);
}

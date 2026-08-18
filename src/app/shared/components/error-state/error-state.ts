import { Component, input, output } from '@angular/core';
import { Button } from '../button/button';
import { EmptyState } from '../empty-state/empty-state';

@Component({
  selector: 'app-error-state',
  imports: [Button, EmptyState],
  templateUrl: './error-state.html',
  styleUrl: './error-state.scss',
  // role="alert" y no un aria-live suelto: cuando esto aparece, el usuario
  // estaba esperando datos y hay que interrumpirlo para avisarle que no llegan.
  host: { role: 'alert' },
})
export class ErrorState {
  // Los textos por defecto explican qué pasó sin culpar al usuario ni pedir
  // disculpas, y la acción dice exactamente qué va a ocurrir al tocarla.
  readonly heading = input('No pudimos cargar esto');
  readonly message = input('Revisá tu conexión y volvé a intentar.');
  readonly retryLabel = input('Reintentar');

  // El estado de error no sabe qué había que recargar: lo avisa hacia arriba,
  // igual que el resto de los componentes de shared/.
  readonly retry = output<void>();
}

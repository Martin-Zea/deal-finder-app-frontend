import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-bottom-sheet',
  imports: [],
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.scss',
  // Escape va sobre el documento y no sobre el panel: si el foco se escapó por
  // algún motivo, la tecla tiene que cerrar igual.
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class BottomSheet {
  readonly open = input(false);

  // Sin título visible propio: quien proyecta el contenido pone el encabezado,
  // y este texto es el que anuncia el diálogo al abrirse.
  readonly ariaLabel = input('');

  readonly closed = output<void>();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      const panel = this.panel();

      if (isOpen && panel) {
        // Guardar quién tenía el foco es lo que permite devolverlo al cerrar:
        // sin eso el usuario de teclado vuelve al principio de la página.
        this.previouslyFocused = document.activeElement as HTMLElement | null;
        panel.nativeElement.focus();
        document.body.style.overflow = 'hidden';
        return;
      }

      if (!isOpen) {
        document.body.style.overflow = '';
        this.previouslyFocused?.focus();
        this.previouslyFocused = null;
      }
    });

    // Si el componente muere con la hoja abierta, el scroll del body quedaría
    // bloqueado para siempre.
    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  protected onEscape(): void {
    if (this.open()) this.closed.emit();
  }

  protected onBackdrop(): void {
    this.closed.emit();
  }

  // Trampa de foco: sin esto el tabulador se va al contenido de atrás, que está
  // tapado pero sigue siendo focusable.
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const panel = this.panel()?.nativeElement;
    if (!panel) return;

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

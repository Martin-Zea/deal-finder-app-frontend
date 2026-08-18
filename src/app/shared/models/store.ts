export interface Store {
  readonly id: string;
  readonly name: string;
  readonly logoUrl: string | null;

  // Depende de la sesión: sin cuenta no hay tarjeta de tienda que vincular, así
  // que el backend lo resuelve contra la sesión y no es un dato de la tienda.
  readonly isLinked: boolean;
}

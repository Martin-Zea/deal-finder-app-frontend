// La forma que la pantalla necesita, no la que devolvería un backend cualquiera.
// Cuando exista la API real, lo que cambia es el servicio: si el JSON no coincide
// con esto, se adapta ahí y la pantalla no se entera.
export interface CouponSummary {
  readonly id: string;

  // En el resumen y no solo en el detalle porque la home filtra por tienda: la
  // lista tiene que saber de quién es cada cupón sin pedir el detalle de todos.
  readonly storeId: string;

  readonly title: string;
  readonly description: string;
  readonly imageUrl: string | null;
}

export interface CouponDetail extends CouponSummary {
  readonly storeName: string;
  readonly storeLogoUrl: string | null;

  // Los montos y la fecha llegan ya formateados: elegir el locale y el símbolo
  // le corresponde a quien trae los datos, no a la plantilla.
  readonly savingsLabel: string;
  readonly expiresLabel: string;

  // Lo calcula el origen de datos y no la vista, porque depende de la fecha del
  // servidor: un teléfono con el reloj corrido no debería pintar de rojo un
  // cupón que todavía no vence.
  readonly expiresSoon: boolean;

  readonly terms: readonly string[];
  readonly products: readonly string[];
}

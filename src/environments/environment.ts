// Un solo archivo por ahora: el backend todavía no está publicado en ningún
// lado, así que no existe una URL de producción real que poner acá. Cuando la
// haya, se agrega environment.production.ts y el fileReplacements en
// angular.json; hasta entonces un build de producción apunta a localhost, que
// es incorrecto pero visible, en vez de a una URL inventada que parecería andar.
export const environment = {
  apiBaseUrl: 'http://localhost:8000',
};

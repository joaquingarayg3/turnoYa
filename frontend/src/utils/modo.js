// La misma cuenta usa la app de dos formas:
// - modo cliente: buscar negocios, reservar y ver sus turnos
// - modo negocio: administrar sus negocios (todo lo que cuelga de /mis-negocios)
// No es un rol: cualquier usuario puede reservar y tambien publicar su negocio.
export const esModoNegocio = (location) => location.startsWith("/mis-negocios")

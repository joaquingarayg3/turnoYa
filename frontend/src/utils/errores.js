// Convierte un error de Axios en un mensaje para mostrar al usuario.
// El back responde de dos formas:
//   - errores propios:          { mensaje: "Credenciales invalidas", datos: null }
//   - validacion de los DTO:    { errors: { Email: ["Email invalido"] } }  (400 automatico de [ApiController])
export function mensajeDeError(error, porDefecto = "Ocurrió un error inesperado. Probá de nuevo.") {
  if (error.response) {
    const datos = error.response.data
    if (datos?.mensaje) return datos.mensaje
    if (datos?.errors) {
      const primero = Object.values(datos.errors).flat()[0]
      if (primero) return primero
    }
    return porDefecto
  }
  if (error.request) {
    // La peticion salio pero no hubo respuesta: el backend no esta corriendo o hay un problema de red
    return "No se pudo conectar con el servidor. ¿Está corriendo el backend?"
  }
  return porDefecto
}

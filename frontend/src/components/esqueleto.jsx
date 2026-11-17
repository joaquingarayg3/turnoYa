// "Esqueletos" de carga: bloques grises animados con la forma del contenido que esta por llegar.
// Se ven mejor que un texto "Cargando..." porque la pagina no salta cuando llegan los datos.
// role="status" + texto oculto: los lectores de pantalla anuncian que se esta cargando.

const bloque = "animate-pulse rounded-md bg-borde/70"

// Tarjetas como las del catalogo
export function TarjetasEsqueleto({ cantidad = 6 }) {
  return (
    <div role="status" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Cargando...</span>
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-borde bg-white">
          <div className={`h-24 rounded-none ${bloque}`} />
          <div className="space-y-3 p-5">
            <div className={`h-5 w-24 ${bloque}`} />
            <div className={`h-6 w-3/4 ${bloque}`} />
            <div className={`h-4 w-full ${bloque}`} />
            <div className={`h-4 w-1/2 ${bloque}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Filas como las de Mis turnos o Mis negocios
export function ListaEsqueleto({ cantidad = 3 }) {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">Cargando...</span>
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-borde bg-white p-4">
          <div className={`h-16 w-16 shrink-0 ${bloque}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-5 w-1/2 ${bloque}`} />
            <div className={`h-4 w-2/3 ${bloque}`} />
            <div className={`h-4 w-1/3 ${bloque}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Encabezado y dos columnas, como el detalle del negocio
export function DetalleEsqueleto() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Cargando...</span>
      <div className="overflow-hidden rounded-2xl border border-borde bg-white">
        <div className={`h-36 rounded-none sm:h-44 ${bloque}`} />
        <div className="space-y-3 p-6">
          <div className={`h-5 w-28 ${bloque}`} />
          <div className={`h-8 w-1/2 ${bloque}`} />
          <div className={`h-4 w-2/3 ${bloque}`} />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <ListaEsqueleto cantidad={2} />
        <div className={`h-64 ${bloque}`} />
      </div>
    </div>
  )
}

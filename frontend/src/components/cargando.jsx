import { Isotipo } from "./logo"

// Indicador de carga: se usa como fallback del <Suspense> y mientras se piden datos a la API
export default function Cargando({ texto = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-pizarra" role="status">
      <div className="animate-pulse">
        <Isotipo size={48} />
      </div>
      <p className="text-sm">{texto}</p>
    </div>
  )
}

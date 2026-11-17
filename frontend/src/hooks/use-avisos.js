import { useContext } from "react"
import { ContextoAvisos } from "../context/contexto-avisos"

// Hook para mostrar un aviso desde cualquier componente:
//   const { avisar } = useAvisos()
//   avisar("Turno reservado")            -> aviso de exito
//   avisar("No se pudo guardar", "error") -> aviso de error
export function useAvisos() {
  const contexto = useContext(ContextoAvisos)
  if (!contexto) {
    throw new Error("useAvisos debe usarse dentro de <ProveedorAvisos>")
  }
  return contexto
}

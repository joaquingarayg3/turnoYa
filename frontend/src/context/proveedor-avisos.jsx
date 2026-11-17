import { useCallback, useState } from "react"
import { ContextoAvisos } from "./contexto-avisos"

const DURACION_MS = 3500

const ESTILOS = {
  exito: "bg-turno text-white",
  error: "bg-red-700 text-white",
}

// Proveedor de los avisos: guarda la lista de avisos visibles y expone avisar(texto, tipo).
// Cada aviso se borra solo a los pocos segundos. Se muestran abajo a la derecha en la PC
// y arriba de la barra inferior en el celular.
export const ProveedorAvisos = ({ children }) => {
  const [avisos, setAvisos] = useState([])

  const quitar = useCallback((id) => {
    setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id))
  }, [])

  const avisar = useCallback(
    (texto, tipo = "exito") => {
      const id = Date.now() + Math.random()
      setAvisos((actuales) => [...actuales, { id, texto, tipo }])
      setTimeout(() => quitar(id), DURACION_MS)
    },
    [quitar]
  )

  return (
    <ContextoAvisos.Provider value={{ avisar }}>
      {children}

      <div
        className="fixed z-50 inset-x-4 bottom-20 sm:inset-x-auto sm:right-6 sm:bottom-6 flex flex-col gap-2 sm:w-96"
        aria-live="polite"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role="status"
            className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${ESTILOS[aviso.tipo]}`}
          >
            <span>{aviso.texto}</span>
            <button
              type="button"
              onClick={() => quitar(aviso.id)}
              aria-label="Cerrar aviso"
              className="shrink-0 opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  )
}

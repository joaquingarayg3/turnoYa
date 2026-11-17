import { useCallback, useState } from "react"
import { ContextoAvisos } from "./contexto-avisos"

const DURACION_MS = 3500
// Lo que dura la animacion de salida (igual que --animate-aviso-salir en index.css)
const SALIDA_MS = 250

// Colores suaves y un poco transparentes, con borde, para que no tapen la pantalla
const ESTILOS = {
  exito: "bg-green-50/90 text-green-900 border-green-200",
  error: "bg-red-50/90 text-red-800 border-red-200",
}

const ICONOS = {
  exito: <path d="M5 12.5 10 17 19 7.5" />,
  error: <path d="M12 7.5v5.5M12 16.5v.01M12 3.5 21 19.5H3Z" />,
}

// Proveedor de los avisos: guarda la lista de avisos visibles y expone avisar(texto, tipo).
// Cada aviso entra con una animacion, a los pocos segundos se desvanece y recien ahi se borra.
// En el celular aparecen arriba (abajo los tapan la barra inferior y el footer);
// en la PC, abajo a la derecha.
export const ProveedorAvisos = ({ children }) => {
  const [avisos, setAvisos] = useState([])

  // Primero se marca como "saliendo" (corre la animacion) y despues se saca de la lista
  const cerrar = useCallback((id) => {
    setAvisos((actuales) => actuales.map((aviso) => (aviso.id === id ? { ...aviso, saliendo: true } : aviso)))
    setTimeout(() => {
      setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id))
    }, SALIDA_MS)
  }, [])

  const avisar = useCallback(
    (texto, tipo = "exito") => {
      const id = Date.now() + Math.random()
      setAvisos((actuales) => [...actuales, { id, texto, tipo, saliendo: false }])
      setTimeout(() => cerrar(id), DURACION_MS)
    },
    [cerrar]
  )

  return (
    <ContextoAvisos.Provider value={{ avisar }}>
      {children}

      <div
        className="pointer-events-none fixed z-50 inset-x-4 top-[4.25rem] sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-6 flex flex-col gap-2 sm:w-96"
        aria-live="polite"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-2 text-sm font-medium shadow-md backdrop-blur-sm motion-reduce:animate-none ${
              ESTILOS[aviso.tipo]
            } ${aviso.saliendo ? "animate-aviso-salir" : "animate-aviso-entrar"}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONOS[aviso.tipo]}
            </svg>
            <span className="flex-1">{aviso.texto}</span>
            <button
              type="button"
              onClick={() => cerrar(aviso.id)}
              aria-label="Cerrar aviso"
              className="-mr-2 shrink-0 px-2 opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  )
}

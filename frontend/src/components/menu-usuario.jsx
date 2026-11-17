import { useEffect, useRef, useState } from "react"
import { Link } from "wouter"

// Menu de la cuenta en el header: "Joaquín ▾" abre las opciones del usuario logueado.
// Primero el cambio de modo (cliente / negocio); el staff (Admin) ve ademas el Panel de Administracion.
export default function MenuUsuario({ usuario, esAdmin, modoNegocio, onSalir }) {
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef(null)

  // Mientras esta abierto: se cierra al tocar afuera o con la tecla Esc
  useEffect(() => {
    if (!abierto) return

    const alTocarAfuera = (evento) => {
      if (contenedor.current && !contenedor.current.contains(evento.target)) setAbierto(false)
    }
    const alApretarTecla = (evento) => {
      if (evento.key === "Escape") setAbierto(false)
    }

    document.addEventListener("mousedown", alTocarAfuera)
    document.addEventListener("keydown", alApretarTecla)
    return () => {
      document.removeEventListener("mousedown", alTocarAfuera)
      document.removeEventListener("keydown", alApretarTecla)
    }
  }, [abierto])

  const inicial = usuario.nombre?.charAt(0).toUpperCase() ?? "?"
  const claseItem = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-fondo"

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Cuenta de ${usuario.nombre}`}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-fondo"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-turno text-sm font-semibold text-white">
          {inicial}
        </span>
        <span className="hidden text-sm font-semibold text-turno sm:inline">{usuario.nombre}</span>
        <span className="text-xs text-pizarra" aria-hidden="true">{abierto ? "▴" : "▾"}</span>
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-borde bg-white p-1.5 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold">
              {usuario.nombre} {usuario.apellido}
            </p>
            <p className="truncate text-xs text-pizarra">{usuario.email}</p>
          </div>
          <div className="my-1 border-t border-borde" />

          <Link
            href={modoNegocio ? "/" : "/mis-negocios"}
            role="menuitem"
            onClick={() => setAbierto(false)}
            className={claseItem}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-ya-texto" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 4 3.5 7.5 7 11M3.5 7.5H17M17 13l3.5 3.5L17 20M20.5 16.5H7" />
            </svg>
            {modoNegocio ? "Volver a reservar" : "Gestionar mi negocio"}
          </Link>

          {esAdmin && (
            <Link href="/admin" role="menuitem" onClick={() => setAbierto(false)} className={claseItem}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-ya-texto" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3 19.5 6v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6Z M9 12l2 2 4-4" />
              </svg>
              Panel de administración
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false)
              onSalir()
            }}
            className={`${claseItem} text-red-700`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />
            </svg>
            Salir
          </button>
        </div>
      )}
    </div>
  )
}

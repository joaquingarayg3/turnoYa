import { Link, useLocation } from "wouter"
import { useAuth } from "../hooks/use-auth"

// Iconos de la barra (trazos simples, viewBox 24x24)
const ICONOS = {
  inicio: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" />,
  turnos: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4M9 14.5l2 2 4-4" />
    </>
  ),
  negocios: (
    <>
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5h16v1a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0 2.7 2.7 0 0 1-5.3 0Z" />
      <path d="M5.5 13v7h13v-7M10 20v-4h4v4" />
    </>
  ),
  admin: <path d="M12 3 19.5 6v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6Z M9 12l2 2 4-4" />,
  ingresar: <path d="M14 4h5v16h-5M10 8l4 4-4 4M14 12H4" />,
  registro: (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 20c.8-3.5 3.6-5.5 7-5.5 1.3 0 2.5.3 3.5.8M18 14v6M15 17h6" />
    </>
  ),
}

function Item({ href, icono, texto, activo }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
        activo ? "text-ya-texto" : "text-pizarra"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICONOS[icono]}
      </svg>
      {texto}
    </Link>
  )
}

// Barra de navegacion fija abajo, solo en el celular (como una app).
// Junta los dos paneles: cliente (Inicio, Mis turnos) y comerciante (Mis negocios), mas Admin para el staff.
export default function BarraInferior() {
  const [location] = useLocation()
  const { usuario, esAdmin } = useAuth()

  return (
    <nav
      aria-label="Navegación principal"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-borde bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex">
        <Item href="/" icono="inicio" texto="Inicio" activo={location === "/" || location.startsWith("/negocios")} />
        {usuario ? (
          <>
            <Item href="/mis-turnos" icono="turnos" texto="Mis turnos" activo={location === "/mis-turnos"} />
            <Item href="/mis-negocios" icono="negocios" texto="Mis negocios" activo={location.startsWith("/mis-negocios")} />
            {esAdmin && <Item href="/admin" icono="admin" texto="Admin" activo={location === "/admin"} />}
          </>
        ) : (
          <>
            <Item href="/login" icono="ingresar" texto="Ingresar" activo={location === "/login"} />
            <Item href="/registro" icono="registro" texto="Crear cuenta" activo={location === "/registro"} />
          </>
        )}
      </div>
    </nav>
  )
}

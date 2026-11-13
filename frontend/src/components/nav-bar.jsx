import { Link, useLocation } from "wouter"
import { useAuth } from "../hooks/use-auth"
import Logo from "./logo"

// Estilo de los links del menu: resalta el de la pagina actual
const claseLink = (activo) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    activo ? "bg-fondo text-turno font-semibold" : "text-pizarra hover:text-turno hover:bg-fondo"
  }`

const claseSelector = (activo) =>
  `px-3 py-1.5 rounded-md transition-colors ${
    activo ? "bg-white text-turno font-semibold shadow-sm" : "text-pizarra hover:text-turno"
  }`

export default function NavBar() {
  const [location, navegar] = useLocation()
  const { usuario, logout } = useAuth()

  // El panel comerciante es todo lo que cuelga de /mis-negocios; el resto es panel cliente
  const enComerciante = location.startsWith("/mis-negocios")

  const salir = () => {
    logout()
    navegar("/")
  }

  return (
    <header className="bg-white border-b border-borde">
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="mr-2" aria-label="TurnoYa, ir al inicio">
          <Logo size={32} />
        </Link>

        {/* Selector de panel: la misma cuenta usa los dos */}
        <div className="flex rounded-lg bg-fondo p-1 text-sm">
          <Link href="/" className={claseSelector(!enComerciante)}>Cliente</Link>
          <Link href="/mis-negocios" className={claseSelector(enComerciante)}>Comerciante</Link>
        </div>

        {/* Links del panel actual */}
        <div className="flex gap-1">
          {enComerciante ? (
            <Link href="/mis-negocios" className={claseLink(location === "/mis-negocios")}>Mis negocios</Link>
          ) : (
            <>
              <Link href="/" className={claseLink(location === "/")}>Catálogo</Link>
              <Link href="/mis-turnos" className={claseLink(location === "/mis-turnos")}>Mis turnos</Link>
            </>
          )}
        </div>

        {/* Sesion */}
        <div className="ml-auto flex items-center gap-2">
          {usuario ? (
            <>
              <span className="text-sm text-pizarra">
                Hola, <span className="font-semibold text-turno">{usuario.nombre}</span>
              </span>
              <button
                type="button"
                onClick={salir}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-borde text-turno hover:bg-fondo"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={claseLink(location === "/login")}>Ingresar</Link>
              <Link
                href="/registro"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-ya text-turno hover:brightness-95 transition"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

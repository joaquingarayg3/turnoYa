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

// Header fijo arriba (sticky).
// En la PC: logo, selector Cliente/Comerciante, links del panel y sesion.
// En el celular: solo logo y sesion; la navegacion pasa a la barra inferior (barra-inferior.jsx).
export default function NavBar() {
  const [location, navegar] = useLocation()
  const { usuario, esAdmin, logout } = useAuth()

  // El panel comerciante es todo lo que cuelga de /mis-negocios; el resto es panel cliente
  const enComerciante = location.startsWith("/mis-negocios")

  const salir = () => {
    logout()
    navegar("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center gap-4">
        <Link href="/" className="mr-2" aria-label="TurnoYa, ir al inicio">
          <Logo size={30} />
        </Link>

        {/* Selector de panel (solo PC): la misma cuenta usa los dos */}
        <div className="hidden sm:flex rounded-lg bg-fondo p-1 text-sm">
          <Link href="/" className={claseSelector(!enComerciante)}>Cliente</Link>
          <Link href="/mis-negocios" className={claseSelector(enComerciante)}>Comerciante</Link>
        </div>

        {/* Links del panel actual (solo PC) */}
        <div className="hidden sm:flex gap-1">
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
              {/* Solo el staff ve el acceso al panel de administracion (en el celular esta en la barra inferior) */}
              {esAdmin && (
                <Link href="/admin" className={`hidden sm:inline-flex ${claseLink(location === "/admin")}`}>Admin</Link>
              )}
              <span className="hidden md:inline text-sm text-pizarra">
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
                className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-semibold bg-ya text-turno hover:brightness-95 transition"
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

import { Link, useLocation } from "wouter"
import { useAuth } from "../hooks/use-auth"
import { esModoNegocio } from "../utils/modo"
import Logo from "./logo"
import MenuUsuario from "./menu-usuario"

// Estilo de los links del menu: resalta el de la pagina actual
const claseLink = (activo) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    activo ? "bg-fondo text-turno font-semibold" : "text-pizarra hover:text-turno hover:bg-fondo"
  }`

// Header fijo arriba (sticky).
// En la PC: logo, links del modo actual y menu de la cuenta.
// El cambio entre modo cliente y modo negocio esta solo en el menu de la cuenta (menu-usuario.jsx):
// la mayoria de los usuarios solo reserva, asi que no se le muestra un boton que no va a usar.
// En el celular: solo logo y menu de la cuenta; la navegacion pasa a la barra inferior (barra-inferior.jsx).
export default function NavBar() {
  const [location, navegar] = useLocation()
  const { usuario, esAdmin, logout } = useAuth()
  const modoNegocio = esModoNegocio(location)
  const enAgenda = location === "/mis-negocios/agenda"

  const salir = () => {
    logout()
    navegar("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center gap-4">
        <div className="mr-2 flex items-center gap-2">
          <Link href={modoNegocio ? "/mis-negocios" : "/"} aria-label="TurnoYa, ir al inicio">
            <Logo size={30} />
          </Link>
          {/* Etiqueta para saber siempre en que modo se esta (tambien en el celular) */}
          {modoNegocio && (
            <span className="rounded-full bg-turno px-2 py-0.5 text-xs font-semibold text-white">Negocios</span>
          )}
        </div>

        {/* Links del modo actual (solo PC) */}
        <div className="hidden sm:flex gap-1">
          {modoNegocio ? (
            <>
              <Link href="/mis-negocios" className={claseLink(!enAgenda)}>Mis negocios</Link>
              <Link href="/mis-negocios/agenda" className={claseLink(enAgenda)}>Agenda</Link>
            </>
          ) : (
            <>
              <Link href="/" className={claseLink(location === "/")}>Explorar</Link>
              {usuario && (
                <Link href="/mis-turnos" className={claseLink(location === "/mis-turnos")}>Mis turnos</Link>
              )}
            </>
          )}
        </div>

        {/* Sesion */}
        <div className="ml-auto flex items-center gap-2">
          {usuario ? (
            <>
              {/* Menu de la cuenta: cambio de modo, Panel de administracion (solo staff) y Salir */}
              <MenuUsuario usuario={usuario} esAdmin={esAdmin} modoNegocio={modoNegocio} onSalir={salir} />
            </>
          ) : (
            <>
              {/* En el celular Ingresar y Crear cuenta estan en la barra inferior: aca solo en la PC */}
              <Link href="/login" className={`hidden sm:inline-flex ${claseLink(location === "/login")}`}>Ingresar</Link>
              <Link
                href="/registro"
                className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-semibold bg-ya-texto active:bg-ya text-white hover:bg-ya transition"
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

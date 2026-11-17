import { Link } from "wouter"
import Logo from "./logo"

// Pie de pagina con los accesos principales y datos de contacto (ficticios)
const claseTitulo = "mb-3 text-sm font-semibold text-white"
const claseLink = "text-sm text-borde transition hover:text-white"

export default function Footer() {
  return (
    <footer className="bg-turno text-borde">
      <div className="max-w-5xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo size={28} negativo />
          <p className="mt-3 text-sm">
            Turnos online para comercios y profesionales de todo el país. Pedí tu turno, ya.
          </p>
        </div>

        <nav aria-label="Para clientes">
          <p className={claseTitulo}>Para clientes</p>
          <ul className="space-y-2">
            <li><Link href="/" className={claseLink}>Buscar negocios</Link></li>
            <li><Link href="/mis-turnos" className={claseLink}>Mis turnos</Link></li>
            <li><Link href="/registro" className={claseLink}>Crear cuenta</Link></li>
          </ul>
        </nav>

        <nav aria-label="Para comercios">
          <p className={claseTitulo}>Para comercios</p>
          <ul className="space-y-2">
            <li><Link href="/mis-negocios/nuevo" className={claseLink}>Publicar mi negocio</Link></li>
            <li><Link href="/mis-negocios" className={claseLink}>Administrar mis negocios</Link></li>
          </ul>
        </nav>

        <div>
          <p className={claseTitulo}>Contacto</p>
          <ul className="space-y-2 text-sm">
            <li>hola@turnoya.com.ar</li>
            <li>(0336) 442-8150</li>
            <li>Av. Savio 1250, San Nicolás de los Arroyos, Buenos Aires</li>
            <li>Lunes a viernes de 9 a 18 h</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs">
          <p>© {new Date().getFullYear()} TurnoYa S.A.S. Todos los derechos reservados.</p>
          <p>Hecho en Argentina 🇦🇷</p>
        </div>
      </div>
    </footer>
  )
}

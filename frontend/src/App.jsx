import { lazy, Suspense } from "react"
import { Route, Switch } from "wouter"
import NavBar from "./components/nav-bar"
import Footer from "./components/footer"
import Cargando from "./components/cargando"
import RutaPrivada from "./components/ruta-privada"

// Lazy loading (modulo 04): cada pagina se descarga recien cuando se navega a ella.
// Las paginas tienen que exportarse con "export default".

// Cliente
const Catalogo = lazy(() => import("./pages/cliente/catalogo"))
const DetalleNegocio = lazy(() => import("./pages/cliente/detalle-negocio"))
const Reservar = lazy(() => import("./pages/cliente/reservar"))
const MisTurnos = lazy(() => import("./pages/cliente/mis-turnos"))

// Comerciante
const MisNegocios = lazy(() => import("./pages/comerciante/mis-negocios"))
const FormNegocio = lazy(() => import("./pages/comerciante/form-negocio"))
const MiNegocio = lazy(() => import("./pages/comerciante/mi-negocio"))

// Auth
const Login = lazy(() => import("./pages/auth/login"))
const Registro = lazy(() => import("./pages/auth/registro"))

const NoEncontrado = lazy(() => import("./pages/no-encontrado"))

// Mapa de rutas de toda la app.
// <Switch> muestra solo la PRIMERA ruta que coincide: las fijas (/nuevo) van antes que las de parametro (/:id).
// Cada track completa SOLO sus paginas; si necesita una ruta nueva, la agrega aca avisando al grupo.
// Las rutas que requieren login van envueltas en <RutaPrivada>: sin sesion, mandan al login.
function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={<Cargando />}>
          <Switch>
            {/* Publicas */}
            <Route path="/" component={Catalogo} />                              {/* D5 */}
            <Route path="/negocios/:id" component={DetalleNegocio} />            {/* D6 */}
            <Route path="/login" component={Login} />                            {/* D4 */}
            <Route path="/registro" component={Registro} />                      {/* D4 */}

            {/* Cliente (requieren login) */}
            <Route path="/negocios/:id/reservar">                                {/* C2 */}
              <RutaPrivada><Reservar /></RutaPrivada>
            </Route>
            <Route path="/mis-turnos">                                           {/* C3 */}
              <RutaPrivada><MisTurnos /></RutaPrivada>
            </Route>

            {/* Comerciante (requieren login) */}
            <Route path="/mis-negocios">                                         {/* A1 */}
              <RutaPrivada><MisNegocios /></RutaPrivada>
            </Route>
            <Route path="/mis-negocios/nuevo">                                   {/* A2 */}
              <RutaPrivada><FormNegocio /></RutaPrivada>
            </Route>
            <Route path="/mis-negocios/:id/editar">                              {/* A2 */}
              <RutaPrivada><FormNegocio /></RutaPrivada>
            </Route>
            <Route path="/mis-negocios/:id">                                     {/* A4 + B1 + B3 */}
              <RutaPrivada><MiNegocio /></RutaPrivada>
            </Route>

            {/* Sin path = cualquier otra direccion */}
            <Route component={NoEncontrado} />
          </Switch>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

export default App

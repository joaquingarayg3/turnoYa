import { Redirect } from "wouter"
import { useAuth } from "../hooks/use-auth"
import Cargando from "./cargando"

// Envuelve las paginas que requieren login. Sin sesion, manda al login.
// Uso en App.jsx:  <Route path="/mis-turnos"><RutaPrivada><MisTurnos /></RutaPrivada></Route>
export default function RutaPrivada({ children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return <Cargando texto="Verificando sesión..." />
  if (!usuario) return <Redirect to="/login" />

  return children
}

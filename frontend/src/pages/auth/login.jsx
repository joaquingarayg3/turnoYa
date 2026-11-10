import { Link } from "wouter"
import Pendiente from "../../components/pendiente"

// D4 · POST /api/auth/login
export default function Login() {
  return (
    <Pendiente titulo="Ingresar" tarea="D4 · Login">
      Email y clave, con validación y los errores del back.
      <div className="mt-3">
        ¿No tenés cuenta? <Link href="/registro" className="font-medium text-ya-texto hover:underline">Creá una</Link>
      </div>
    </Pendiente>
  )
}

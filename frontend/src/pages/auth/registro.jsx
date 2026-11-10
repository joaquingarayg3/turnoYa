import { Link } from "wouter"
import Pendiente from "../../components/pendiente"

// D4 · POST /api/auth/register
export default function Registro() {
  return (
    <Pendiente titulo="Crear cuenta" tarea="D4 · Registro">
      Nombre, apellido, email, clave y teléfono, con validación y los errores del back.
      <div className="mt-3">
        ¿Ya tenés cuenta? <Link href="/login" className="font-medium text-ya-texto hover:underline">Ingresá</Link>
      </div>
    </Pendiente>
  )
}

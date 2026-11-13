import { Link } from "wouter"
import Pendiente from "../../components/pendiente"

// A1 · GET /api/negocios/mios   ·   A3 · PATCH /api/negocios/{id}/estado
export default function MisNegocios() {
  return (
    <Pendiente titulo="Mis negocios" tarea="A1 · Lista de mis negocios">
      Lista con estado activo/inactivo.
      <div className="mt-3 flex gap-4">
        <Link href="/mis-negocios/nuevo" className="font-medium text-ya-texto hover:underline">+ Nuevo negocio</Link>
        <Link href="/mis-negocios/1" className="font-medium text-ya-texto hover:underline">Ver negocio de ejemplo (#1)</Link>
      </div>
    </Pendiente>
  )
}

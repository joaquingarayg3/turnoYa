import { Link, useParams } from "wouter"
import Pendiente from "../../components/pendiente"

// D6 · GET /api/catalogo/negocios/{id}
export default function DetalleNegocio() {
  const { id } = useParams()

  return (
    <Pendiente titulo={`Negocio #${id}`} tarea="D6 · Detalle del negocio">
      Datos del negocio y sus servicios activos con precio y duración.
      <div className="mt-3">
        <Link href={`/negocios/${id}/reservar`} className="font-medium text-ya-texto hover:underline">
          Reservar un turno →
        </Link>
      </div>
    </Pendiente>
  )
}

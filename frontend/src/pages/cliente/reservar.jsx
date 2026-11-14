import { useParams } from "wouter"
import Pendiente from "../../components/pendiente"

// C2 · POST /api/turnos  (los datos del negocio salen de GET /api/catalogo/negocios/{id})
export default function Reservar() {
  const { id } = useParams()

  return (
    <Pendiente titulo="Reservar turno" tarea="C2 · Formulario de reserva">
      Negocio #{id}: elegir servicio, fecha y hora (con el intervalo del negocio) y notas.
    </Pendiente>
  )
}

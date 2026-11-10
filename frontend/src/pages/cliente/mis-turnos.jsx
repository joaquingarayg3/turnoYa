import Pendiente from "../../components/pendiente"

// C3 · GET /api/turnos/mios  y  PATCH /api/turnos/{id}/cancelar
export default function MisTurnos() {
  return (
    <Pendiente titulo="Mis turnos" tarea="C3 · Mis turnos">
      Próximos y pasados, con su estado y botón para cancelar.
    </Pendiente>
  )
}

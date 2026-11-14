import { useParams } from "wouter"
import Pendiente from "../../components/pendiente"

// A2 · POST /api/negocios  y  PUT /api/negocios/{id}
// La misma pagina sirve para crear (sin id) y para editar (con id)
export default function FormNegocio() {
  const { id } = useParams()
  const editando = id !== undefined

  return (
    <Pendiente titulo={editando ? `Editar negocio #${id}` : 'Nuevo negocio'} tarea="A2 · Formulario de negocio">
      Nombre, rubro, descripción, dirección, teléfono, intervalo de turnos, anticipación máxima y tolerancia de cancelación.
    </Pendiente>
  )
}

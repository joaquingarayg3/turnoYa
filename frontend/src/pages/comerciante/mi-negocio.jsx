import { useState } from "react"
import { Link, useParams } from "wouter"
import Pendiente from "../../components/pendiente"

// A4 · GET /api/negocios/{id}
// Pestañas donde el track B monta sus componentes:
//   Servicios -> B1 / B2   ·   Agenda -> B3
export default function MiNegocio() {
  const { id } = useParams()
  const [pestana, setPestana] = useState('servicios')

  const clasePestana = (nombre) =>
    `px-4 py-2 text-sm font-medium border-b-2 ${
      pestana === nombre ? 'border-ya text-turno' : 'border-transparent text-pizarra hover:text-turno'
    }`

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Negocio #{id}</h1>
        <Link href={`/mis-negocios/${id}/editar`} className="text-sm font-medium text-ya-texto hover:underline">
          Editar datos
        </Link>
      </div>

      <div className="flex border-b border-borde mb-6">
        <button className={clasePestana('servicios')} onClick={() => setPestana('servicios')}>Servicios</button>
        <button className={clasePestana('agenda')} onClick={() => setPestana('agenda')}>Agenda</button>
      </div>

      {pestana === 'servicios' && (
        <Pendiente titulo="Servicios" tarea="B1 / B2 · Servicios del negocio">
          Lista, crear/editar y activar/desactivar.
        </Pendiente>
      )}
      {pestana === 'agenda' && (
        <Pendiente titulo="Agenda" tarea="B3 · Agenda del negocio">
          Turnos del día, con Confirmar y Cancelar.
        </Pendiente>
      )}
    </section>
  )
}

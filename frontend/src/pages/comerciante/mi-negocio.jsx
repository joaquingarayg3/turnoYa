import { useState, useEffect } from "react"
import { Link, useParams } from "wouter"
import clienteAxios from "../../api/clienteAxios"
import { mensajeDeError } from "../../utils/errores"
import Pendiente from "../../components/pendiente"

// A4 · GET /api/negocios/{id}
// Pestañas donde el track B monta sus componentes:
//   Servicios -> B1 / B2   ·   Agenda -> B3
export default function MiNegocio() {
  const { id } = useParams()
  const [pestana, setPestana] = useState('servicios')
  const [negocio, setNegocio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controlador = new AbortController() // Crea un controlador para poder cancelar la petición HTTP

    async function cargarNegocio() {
      setCargando(true)
      setError("") // Finaliza el estado de carga. deja de mostrar "Cargando...".


      try {
        const respuesta = await clienteAxios.get(`/negocios/${id}`, {
          signal: controlador.signal,
        })

        setNegocio(respuesta.data.datos)
      } catch (error) {
        if (!controlador.signal.aborted) {
          setError(mensajeDeError(error))
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }
    cargarNegocio()

    return () => controlador.abort()
  }, [id])

  if (cargando) {
    return <p>Cargando negocio...</p>
  }

  if (error) {
    return (
      <p role="alert" className="text-red-700">
        {error}
      </p>
    )
  }

  if (!negocio) {
    return <p>No se pudo cargar el negocio.</p>
  }
  const clasePestana = (nombre) =>
    `px-4 py-2 text-sm font-medium border-b-2 ${pestana === nombre ? 'border-ya text-turno' : 'border-transparent text-pizarra hover:text-turno'
    }`

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{negocio.nombre}</h1>
          <p className="mt-1 text-pizarra">{negocio.rubro}</p>
        </div>

        <Link
          href={`/mis-negocios/${id}/editar`}
          className="text-sm font-medium text-ya-texto hover:underline"

        >
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

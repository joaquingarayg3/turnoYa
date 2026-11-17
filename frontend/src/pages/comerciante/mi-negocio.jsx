import { useState, useEffect } from "react"
import { Link, useParams } from "wouter"
import clienteAxios from "../../api/clienteAxios"
import { mensajeDeError } from "../../utils/errores"
import Cargando from "../../components/cargando"
import ServiciosNegocio from "../../components/comerciante/servicios-negocio"
import AgendaNegocio from "../../components/comerciante/agenda-negocio"
import HorariosNegocio from "../../components/comerciante/horarios-negocio"

// A4 · GET /api/negocios/{id}
// Encabezado con los datos del negocio y las pestañas donde se montan los componentes del track B:
//   Servicios -> B1 / B2   ·   Horarios -> de atención   ·   Agenda -> B3
export default function MiNegocio() {
  const { id } = useParams()
  const [pestana, setPestana] = useState("servicios")
  const [negocio, setNegocio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controlador = new AbortController() // Crea un controlador para poder cancelar la petición HTTP

    async function cargarNegocio() {
      setCargando(true)
      setError("") // Limpia el error de un intento anterior

      try {
        const respuesta = await clienteAxios.get(`/negocios/${id}`, {
          signal: controlador.signal,
        })

        setNegocio(respuesta.data.datos)
      } catch (error) {
        if (!controlador.signal.aborted) {
          const status = error.response?.status
          if (status === 404) setError("El negocio no existe.")
          else if (status === 403) setError("No tenés permiso para administrar este negocio.")
          else setError(mensajeDeError(error))
        }
      } finally {
        // Finaliza el estado de carga: deja de mostrar "Cargando..."
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }
    cargarNegocio()

    return () => controlador.abort()
  }, [id])

  if (cargando) {
    return <Cargando texto="Cargando negocio..." />
  }

  if (error || !negocio) {
    return (
      <section>
        <p role="alert" className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error || "No se pudo cargar el negocio."}
        </p>
        <Link href="/mis-negocios" className="mt-4 inline-block font-medium text-ya-texto hover:underline">
          Volver a mis negocios
        </Link>
      </section>
    )
  }

  const clasePestana = (nombre) =>
    `px-4 py-2 text-sm font-medium border-b-2 ${
      pestana === nombre ? "border-ya text-turno" : "border-transparent text-pizarra hover:text-turno"
    }`

  return (
    <section>
      <Link href="/mis-negocios" className="text-sm font-medium text-ya-texto hover:underline">
        ← Mis negocios
      </Link>

      <div className="mt-2 flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{negocio.nombre}</h1>
          <p className="mt-1 text-pizarra">
            {negocio.rubro}
            {!negocio.isActivo && " · Inactivo (no aparece en el catálogo)"}
          </p>
        </div>

        <Link
          href={`/mis-negocios/${id}/editar`}
          className="text-sm font-medium text-ya-texto hover:underline"
        >
          Editar datos
        </Link>
      </div>

      <div className="flex border-b border-borde mb-6">
        <button type="button" className={clasePestana("servicios")} onClick={() => setPestana("servicios")}>Servicios</button>
        <button type="button" className={clasePestana("horarios")} onClick={() => setPestana("horarios")}>Horarios</button>
        <button type="button" className={clasePestana("agenda")} onClick={() => setPestana("agenda")}>Agenda</button>
      </div>

      {pestana === "servicios" && <ServiciosNegocio negocioId={id} />}
      {pestana === "horarios" && <HorariosNegocio negocioId={id} />}
      {pestana === "agenda" && <AgendaNegocio negocioId={id} />}
    </section>
  )
}

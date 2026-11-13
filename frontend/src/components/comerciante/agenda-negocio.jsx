import { useCallback, useEffect, useState } from "react"
import clienteAxios from "../../api/clienteAxios"

// Mismo orden que el enum EstadoTurno del backend (por si llega como número)
const ESTADOS = ["Pendiente", "Confirmado", "Cancelado", "Completado"]

const COLORES_ESTADO = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmado: "bg-green-100 text-green-700",
  Cancelado: "bg-red-100 text-red-700",
  Completado: "bg-blue-100 text-blue-700",
}

// Fecha local en formato año-mes-día (lo que espera el backend)
function formatearFecha(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, "0")
  const dia = String(fecha.getDate()).padStart(2, "0")
  return `${anio}-${mes}-${dia}`
}

function sumarDias(fechaTexto, dias) {
  const [anio, mes, dia] = fechaTexto.split("-").map(Number)
  return formatearFecha(new Date(anio, mes - 1, dia + dias))
}

function nombreEstado(estado) {
  return typeof estado === "number" ? ESTADOS[estado] : estado
}

function hora(fechaHora) {
  return new Date(fechaHora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

export default function AgendaNegocio({ negocioId }) {
  const [fecha, setFecha] = useState(formatearFecha(new Date()))
  const [turnos, setTurnos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)
  const [procesando, setProcesando] = useState(null) // id del turno que se está confirmando/cancelando

  const cargarAgenda = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await clienteAxios.get(`/negocios/${negocioId}/turnos`, { params: { fecha } })
      const lista = [...respuesta.data.datos].sort(
        (a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio)
      )
      setTurnos(lista)
    } catch (err) {
      const status = err.response?.status
      if (status === 404) setError("El negocio no existe.")
      else if (status === 403) setError("No tenés permiso para ver la agenda de este negocio.")
      else setError("No se pudo cargar la agenda.")
    } finally {
      setCargando(false)
    }
  }, [negocioId, fecha])

  useEffect(() => {
    cargarAgenda()
  }, [cargarAgenda])

  // accion = "confirmar" o "cancelar" -> PUT /api/turnos/{id}/confirmar o /cancelar
  const cambiarEstado = async (turno, accion) => {
    if (accion === "cancelar" && !window.confirm(`¿Cancelar el turno de ${turno.clienteNombre}?`)) return

    setProcesando(turno.id)
    setErrorAccion(null)
    try {
      await clienteAxios.put(`/turnos/${turno.id}/${accion}`)
      await cargarAgenda()
    } catch (err) {
      setErrorAccion(err.response?.data?.mensaje ?? `No se pudo ${accion} el turno.`)
    } finally {
      setProcesando(null)
    }
  }

  const claseBoton = "text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-gray-200 disabled:opacity-50"

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Agenda</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setFecha(sumarDias(fecha, -1))} className={claseBoton}>←</button>
          <input
            type="date"
            value={fecha}
            onChange={(e) => e.target.value && setFecha(e.target.value)}
            className="rounded-lg border border-borde px-3 py-1 bg-white"
          />
          <button onClick={() => setFecha(sumarDias(fecha, 1))} className={claseBoton}>→</button>
          <button onClick={() => setFecha(formatearFecha(new Date()))} className={claseBoton}>Hoy</button>
        </div>
      </div>

      {errorAccion && <p className="mb-4 text-sm text-red-600">{errorAccion}</p>}

      {cargando ? (
        <p className="text-pizarra">Cargando agenda...</p>
      ) : error ? (
        <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</p>
      ) : turnos.length === 0 ? (
        <p className="text-pizarra">No hay turnos para este día.</p>
      ) : (
        <ul className="space-y-3">
          {turnos.map((turno) => {
            const estado = nombreEstado(turno.estado)
            const puedeConfirmar = estado === "Pendiente"
            const puedeCancelar = estado === "Pendiente" || estado === "Confirmado"

            return (
              <li
                key={turno.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-borde"
              >
                <div>
                  <p className="font-semibold">
                    {hora(turno.fechaHoraInicio)} – {hora(turno.fechaHoraFin)} · {turno.servicioNombre}
                  </p>
                  <p className="text-sm text-pizarra">
                    {turno.clienteNombre}
                    {turno.clienteTelefono && ` · ${turno.clienteTelefono}`}
                  </p>
                  {turno.notas && <p className="text-sm text-pizarra italic">“{turno.notas}”</p>}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${COLORES_ESTADO[estado] ?? ""}`}>
                    {estado}
                  </span>
                  {puedeConfirmar && (
                    <button
                      onClick={() => cambiarEstado(turno, "confirmar")}
                      disabled={procesando === turno.id}
                      className="text-sm px-3 py-1 rounded-lg bg-ya font-semibold transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                    >
                      Confirmar
                    </button>
                  )}
                  {puedeCancelar && (
                    <button
                      onClick={() => cambiarEstado(turno, "cancelar")}
                      disabled={procesando === turno.id}
                      className={claseBoton}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
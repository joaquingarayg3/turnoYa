import { useEffect, useState } from "react"
import clienteAxios from "../../api/clienteAxios"
import { mensajeDeError } from "../../utils/errores"
import { useAvisos } from "../../hooks/use-avisos"
import Cargando from "../cargando"
import { COLORES_ESTADO, formatearFecha, hora, nombreEstado, sumarDias } from "../../utils/agenda"

export default function AgendaNegocio({ negocioId }) {
  const [fecha, setFecha] = useState(formatearFecha(new Date()))
  const [turnos, setTurnos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)
  const [procesando, setProcesando] = useState(null) // id del turno que se está confirmando/cancelando
  // Al cambiar este numero se vuelve a pedir la agenda
  const [recarga, setRecarga] = useState(0)
  const { avisar } = useAvisos()

  // Patron del modulo 08: la funcion async se define dentro del efecto.
  // Se vuelve a ejecutar cuando cambia el negocio, el dia elegido o despues de una accion.
  useEffect(() => {
    const cargarAgenda = async () => {
      try {
        setCargando(true)
        const respuesta = await clienteAxios.get(`/negocios/${negocioId}/turnos`, { params: { fecha } })
        const lista = [...respuesta.data.datos].sort(
          (a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio)
        )
        setTurnos(lista)
        setError(null)
      } catch (err) {
        const status = err.response?.status
        if (status === 404) setError("El negocio no existe.")
        else if (status === 403) setError("No tenés permiso para ver la agenda de este negocio.")
        else setError(mensajeDeError(err, "No se pudo cargar la agenda."))
      } finally {
        setCargando(false)
      }
    }
    cargarAgenda()
  }, [negocioId, fecha, recarga])

  // accion = "confirmar" o "cancelar" -> PUT /api/turnos/{id}/confirmar o /cancelar
  const cambiarEstado = async (turno, accion) => {
    if (accion === "cancelar" && !window.confirm(`¿Cancelar el turno de ${turno.clienteNombre}?`)) return

    setProcesando(turno.id)
    setErrorAccion(null)
    try {
      await clienteAxios.put(`/turnos/${turno.id}/${accion}`)
      avisar(accion === "confirmar" ? "Turno confirmado." : "Turno cancelado.")
      setRecarga((n) => n + 1)
    } catch (err) {
      setErrorAccion(mensajeDeError(err, `No se pudo ${accion} el turno.`))
    } finally {
      setProcesando(null)
    }
  }

  const claseBoton = "text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-fondo disabled:opacity-50"

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Agenda</h2>
        <div className="flex items-center gap-2">
          {/* "Hoy" a la izquierda, lejos de la flecha de avanzar, para no tocarlo sin querer */}
          <button onClick={() => setFecha(formatearFecha(new Date()))} className={claseBoton}>Hoy</button>
          <button onClick={() => setFecha(sumarDias(fecha, -1))} className={claseBoton} aria-label="Día anterior">←</button>
          <input
            type="date"
            value={fecha}
            onChange={(e) => e.target.value && setFecha(e.target.value)}
            className="rounded-lg border border-borde px-3 py-1 bg-white"
            aria-label="Fecha de la agenda"
          />
          <button onClick={() => setFecha(sumarDias(fecha, 1))} className={claseBoton} aria-label="Día siguiente">→</button>
        </div>
      </div>

      {errorAccion && <p className="mb-4 text-sm text-red-700" role="alert">{errorAccion}</p>}

      {cargando ? (
        <Cargando texto="Cargando agenda..." />
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
                      className="text-sm px-3 py-1 rounded-lg bg-ya-texto active:bg-ya text-white font-semibold transition hover:bg-ya active:scale-95 disabled:opacity-50"
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

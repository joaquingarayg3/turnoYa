import { useEffect, useState } from "react"
import { Link } from "wouter"
import clienteAxios from "../../api/clienteAxios"
import { ListaEsqueleto } from "../../components/esqueleto"
import { IconoRubro } from "../../components/portada-negocio"
import { useAvisos } from "../../hooks/use-avisos"
import { mensajeDeError } from "../../utils/errores"
import { COLORES_ESTADO, formatearFecha, hora, nombreDia, nombreEstado, sumarDias } from "../../utils/agenda"

// Agenda de TODOS los negocios del usuario en una sola lista del dia, ordenada por hora.
// GET /api/negocios/mios para saber que negocios tiene, y despues
// GET /api/negocios/{id}/turnos?fecha= de cada uno, todos a la vez (Promise.all), y se juntan.
// Se puede filtrar por negocio y confirmar o cancelar cada turno, igual que en la agenda de un negocio.
export default function Agenda() {
  const [negocios, setNegocios] = useState(null) // null = todavia no se cargaron
  const [fecha, setFecha] = useState(formatearFecha(new Date()))
  const [turnos, setTurnos] = useState([])
  const [filtro, setFiltro] = useState(null) // id del negocio elegido, o null para ver todos
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)
  const [procesando, setProcesando] = useState(null) // id del turno que se esta confirmando/cancelando
  // Al cambiar este numero se vuelve a pedir la agenda
  const [recarga, setRecarga] = useState(0)
  const { avisar } = useAvisos()

  // 1) Los negocios del usuario (una sola vez)
  useEffect(() => {
    const controlador = new AbortController()

    async function cargarNegocios() {
      try {
        const respuesta = await clienteAxios.get("/negocios/mios", { signal: controlador.signal })
        setNegocios(respuesta.data.datos)
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(mensajeDeError(err, "No se pudieron cargar tus negocios."))
          setCargando(false)
        }
      }
    }

    cargarNegocios()
    return () => controlador.abort()
  }, [])

  // 2) Los turnos del dia de todos los negocios. Se repite al cambiar el dia o despues de una accion.
  useEffect(() => {
    if (negocios === null) return
    const controlador = new AbortController()

    async function cargarTurnos() {
      try {
        setCargando(true)
        const respuestas = await Promise.all(
          negocios.map((negocio) =>
            clienteAxios.get(`/negocios/${negocio.id}/turnos`, { params: { fecha }, signal: controlador.signal })
          )
        )
        const todos = respuestas
          .flatMap((respuesta) => respuesta.data.datos)
          .sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio))
        setTurnos(todos)
        setError(null)
      } catch (err) {
        if (!controlador.signal.aborted) setError(mensajeDeError(err, "No se pudo cargar la agenda."))
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    cargarTurnos()
    return () => controlador.abort()
  }, [negocios, fecha, recarga])

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

  // Sin negocios todavia: se invita a crear el primero
  if (negocios !== null && negocios.length === 0) {
    return (
      <section className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <p className="mt-3 text-pizarra">Todavía no tenés negocios. Cuando crees uno, acá vas a ver sus turnos del día.</p>
        <Link
          href="/mis-negocios/nuevo"
          className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-ya-texto active:bg-ya text-white font-semibold transition hover:bg-ya"
        >
          Crear mi negocio
        </Link>
      </section>
    )
  }

  const rubroDe = (negocioId) => negocios?.find((negocio) => negocio.id === negocioId)?.rubro
  const visibles = filtro === null ? turnos : turnos.filter((turno) => turno.negocioId === filtro)
  const porConfirmar = visibles.filter((turno) => nombreEstado(turno.estado) === "Pendiente").length
  const esHoy = fecha === formatearFecha(new Date())

  const claseBoton = "text-sm px-3 py-1.5 rounded-lg border border-borde bg-white transition hover:bg-fondo disabled:opacity-50"
  const claseFiltro = (activo) =>
    `shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
      activo ? "border-turno bg-turno text-white" : "border-borde bg-white text-pizarra hover:text-turno"
    }`

  return (
    <section>
      <h1 className="text-3xl font-bold">Agenda</h1>
      <p className="mt-1 text-pizarra">Los turnos de todos tus negocios, día por día.</p>

      {/* Dia elegido: flechas, calendario y atajo a hoy */}
      {/* En el celular va todo centrado, uno debajo del otro; en la PC, el dia a la izquierda y los controles a la derecha */}
      <div className="mt-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-semibold first-letter:uppercase">
            {esHoy ? "Hoy, " : ""}
            {nombreDia(fecha)}
          </p>
          {!cargando && !error && (
            <p className="text-sm text-pizarra">
              {visibles.length === 0
                ? "Sin turnos"
                : `${visibles.length} ${visibles.length === 1 ? "turno" : "turnos"}`}
              {porConfirmar > 0 && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {porConfirmar} por confirmar
                </span>
              )}
            </p>
          )}
        </div>
        {/* Celular: "Hoy" arriba y debajo las flechas con la fecha, todo centrado.
            PC: "Hoy" a la izquierda de las flechas, lejos de la de avanzar para no tocarlo sin querer.
            Si ya se esta en el dia de hoy, "Hoy" queda invisible pero ocupa su lugar: asi las flechas no se mueven. */}
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <button
            onClick={() => setFecha(formatearFecha(new Date()))}
            className={`${claseBoton} ${esHoy ? "invisible" : ""}`}
            aria-hidden={esHoy}
            tabIndex={esHoy ? -1 : 0}
          >
            Hoy
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setFecha(sumarDias(fecha, -1))} className={claseBoton} aria-label="Día anterior">←</button>
            <input
              type="date"
              value={fecha}
              onChange={(e) => e.target.value && setFecha(e.target.value)}
              className="w-40 rounded-lg border border-borde bg-white px-3 py-1.5"
              aria-label="Fecha de la agenda"
            />
            <button onClick={() => setFecha(sumarDias(fecha, 1))} className={claseBoton} aria-label="Día siguiente">→</button>
          </div>
        </div>
      </div>

      {/* Filtro por negocio: solo si hay mas de uno. En el celular se desliza de costado. */}
      {negocios && negocios.length > 1 && (
        <div className="mt-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button onClick={() => setFiltro(null)} className={claseFiltro(filtro === null)}>Todos</button>
          {negocios.map((negocio) => (
            <button key={negocio.id} onClick={() => setFiltro(negocio.id)} className={claseFiltro(filtro === negocio.id)}>
              <IconoRubro rubro={negocio.rubro} className="h-4 w-4" />
              {negocio.nombre}
            </button>
          ))}
        </div>
      )}

      {errorAccion && <p className="mt-4 text-sm text-red-700" role="alert">{errorAccion}</p>}

      <div className="mt-5">
        {cargando ? (
          <ListaEsqueleto />
        ) : error ? (
          <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200" role="alert">{error}</p>
        ) : visibles.length === 0 ? (
          <p className="p-6 rounded-xl border border-dashed border-borde bg-white text-center text-pizarra">
            No hay turnos para este día.
          </p>
        ) : (
          <ul className="space-y-3">
            {visibles.map((turno) => {
              const estado = nombreEstado(turno.estado)
              const puedeConfirmar = estado === "Pendiente"
              const puedeCancelar = estado === "Pendiente" || estado === "Confirmado"

              return (
                <li key={turno.id} className="flex gap-4 p-4 bg-white rounded-xl border border-borde">
                  {/* Hora bien visible a la izquierda, como en una agenda de papel */}
                  <div className="w-14 shrink-0">
                    <p className="text-lg font-bold leading-tight">{hora(turno.fechaHoraInicio)}</p>
                    <p className="text-xs text-pizarra">a {hora(turno.fechaHoraFin)}</p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{turno.servicioNombre}</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${COLORES_ESTADO[estado] ?? ""}`}>
                        {estado}
                      </span>
                    </div>
                    <p className="text-sm text-pizarra">
                      {turno.clienteNombre}
                      {turno.clienteTelefono && ` · ${turno.clienteTelefono}`}
                    </p>
                    {turno.notas && <p className="text-sm text-pizarra italic">“{turno.notas}”</p>}

                    {/* De que negocio es (no hace falta si se esta filtrando uno solo) */}
                    {filtro === null && negocios.length > 1 && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-turno">
                        <IconoRubro rubro={rubroDe(turno.negocioId)} className="h-3.5 w-3.5" color="#E2700B" />
                        {turno.negocioNombre}
                      </p>
                    )}

                    {(puedeConfirmar || puedeCancelar) && (
                      <div className="mt-3 flex gap-2">
                        {puedeConfirmar && (
                          <button
                            onClick={() => cambiarEstado(turno, "confirmar")}
                            disabled={procesando === turno.id}
                            className="text-sm px-3 py-1.5 rounded-lg bg-ya-texto active:bg-ya text-white font-semibold transition hover:bg-ya active:scale-95 disabled:opacity-50"
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
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

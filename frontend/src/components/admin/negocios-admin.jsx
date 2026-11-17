import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "wouter"
import clienteAxios from "../../api/clienteAxios"
import { esquemaRechazo } from "../../schemas/admin-schemas"
import { DIAS_SEMANA, horaCorta } from "../../utils/dias"
import { mensajeDeError } from "../../utils/errores"
import { useAvisos } from "../../hooks/use-avisos"
import Cargando from "../cargando"
import PortadaNegocio from "../portada-negocio"

const claseBoton = "text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-fondo disabled:opacity-50"

const ETIQUETA_APROBACION = {
  Pendiente: { texto: "Pendiente de aprobación", clase: "bg-amber-100 text-amber-800" },
  Rechazado: { texto: "Rechazado", clase: "bg-red-100 text-red-700" },
}

// Resumen del comercio para decidir si aprobarlo: datos, configuracion, servicios, horarios
// y una lista de chequeo con lo minimo que deberia tener cargado
function ResumenComercio({ negocio }) {
  const serviciosActivos = negocio.servicios.filter((s) => s.isActivo)
  const chequeos = [
    { ok: Boolean(negocio.descripcion?.trim()), texto: "Tiene descripción" },
    { ok: Boolean(negocio.direccion?.trim()), texto: "Tiene dirección" },
    { ok: Boolean(negocio.telefono?.trim()), texto: "Tiene teléfono de contacto" },
    { ok: serviciosActivos.length > 0, texto: "Tiene al menos un servicio activo" },
    { ok: negocio.horarios.length > 0, texto: "Cargó sus horarios de atención" },
  ]
  const claseTitulo = "mb-2 text-sm font-semibold text-turno"

  return (
    <div className="w-full mt-2 pt-4 border-t border-borde grid gap-6 md:grid-cols-2 text-sm">
      {/* Portada tal como la van a ver los clientes (imagen del dueño o la del rubro) */}
      <div className="md:col-span-2">
        <div className="overflow-hidden rounded-xl border border-borde">
          <PortadaNegocio rubro={negocio.rubro} imagen={negocio.bannerUrl} alto="h-28" />
        </div>
        <p className="mt-1 text-xs text-pizarra break-all">
          {negocio.bannerUrl ? `Imagen cargada por el dueño: ${negocio.bannerUrl}` : "Sin imagen propia: se usa la portada del rubro."}
        </p>
      </div>

      <div className="space-y-5">
        <section>
          <h3 className={claseTitulo}>Para revisar</h3>
          <ul className="space-y-1">
            {chequeos.map((chequeo) => (
              <li key={chequeo.texto} className={chequeo.ok ? "text-green-700" : "text-red-700"}>
                {chequeo.ok ? "✓" : "✗"} {chequeo.texto}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className={claseTitulo}>Datos del negocio</h3>
          <dl className="space-y-1 text-pizarra">
            <div><dt className="inline font-medium text-turno">Descripción: </dt><dd className="inline">{negocio.descripcion || "—"}</dd></div>
            <div><dt className="inline font-medium text-turno">Dirección: </dt><dd className="inline">{negocio.direccion || "—"}</dd></div>
            <div><dt className="inline font-medium text-turno">Teléfono: </dt><dd className="inline">{negocio.telefono || "—"}</dd></div>
          </dl>
        </section>

        <section>
          <h3 className={claseTitulo}>Configuración de turnos</h3>
          <p className="text-pizarra">
            Turnos cada {negocio.intervaloTurnosMinutos} min · reservas hasta {negocio.diasMaxAnticipacion} días antes ·
            el cliente cancela hasta {negocio.horasToleranciaCancelacion} h antes
          </p>
        </section>
      </div>

      <div className="space-y-5">
        <section>
          <h3 className={claseTitulo}>Servicios ({negocio.servicios.length})</h3>
          {negocio.servicios.length === 0 ? (
            <p className="text-pizarra">Todavía no cargó servicios.</p>
          ) : (
            <ul className="space-y-1">
              {negocio.servicios.map((servicio) => (
                <li key={servicio.id} className={servicio.isActivo ? "" : "text-pizarra"}>
                  {servicio.nombre} · {servicio.duracionMinutos} min · ${Number(servicio.precio).toLocaleString("es-AR")}
                  {!servicio.isActivo && " (inactivo)"}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className={claseTitulo}>Horarios de atención</h3>
          {negocio.horarios.length === 0 ? (
            <p className="text-pizarra">Todavía no cargó horarios.</p>
          ) : (
            <ul className="space-y-1">
              {DIAS_SEMANA.map((dia) => {
                const franjas = negocio.horarios.filter((h) => h.diaSemana === dia.valor)
                return (
                  <li key={dia.valor} className="flex justify-between gap-3">
                    <span>{dia.nombre}</span>
                    <span className={franjas.length === 0 ? "text-pizarra" : ""}>
                      {franjas.length === 0
                        ? "Cerrado"
                        : franjas.map((f) => `${horaCorta(f.horaDesde)} a ${horaCorta(f.horaHasta)}`).join(" · ")}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

// Formulario para escribir el motivo del rechazo (React Hook Form + Zod)
function FormRechazo({ negocio, onRechazar, onCancelar }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquemaRechazo), defaultValues: { motivo: "" } })

  const enviar = async (datos) => {
    try {
      await onRechazar(negocio, datos.motivo)
    } catch (err) {
      setError("root", { message: mensajeDeError(err, "No se pudo rechazar el negocio.") })
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="w-full mt-2 space-y-2" noValidate>
      <label htmlFor={`motivo-${negocio.id}`} className="block text-sm font-medium">
        Motivo del rechazo (lo ve el dueño)
      </label>
      <textarea
        id={`motivo-${negocio.id}`}
        rows={2}
        className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya ${
          errors.motivo ? "border-red-600" : "border-borde"
        }`}
        {...register("motivo")}
      />
      {errors.motivo && <p className="text-sm text-red-700">{errors.motivo.message}</p>}
      {errors.root && <p className="text-sm text-red-700" role="alert">{errors.root.message}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-sm px-3 py-1 rounded-lg bg-red-700 text-white font-semibold transition hover:brightness-110 disabled:opacity-50"
        >
          {isSubmitting ? "Rechazando..." : "Confirmar rechazo"}
        </button>
        <button type="button" onClick={onCancelar} className={claseBoton}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// GET /api/negocios/todos, PUT /api/negocios/{id}/aprobacion y PUT /api/negocios/{id}/estado (Admin)
export default function NegociosAdmin() {
  const [negocios, setNegocios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)
  const [procesando, setProcesando] = useState(null)
  const [rechazando, setRechazando] = useState(null) // id del negocio con el formulario de rechazo abierto
  const [abierto, setAbierto] = useState(null) // id del negocio con el resumen desplegado
  const [busqueda, setBusqueda] = useState("")
  const { avisar } = useAvisos()

  // Patron del modulo 08: la funcion async se define dentro del efecto
  useEffect(() => {
    const cargarNegocios = async () => {
      try {
        setCargando(true)
        // El back los devuelve con los pendientes de aprobacion primero
        const respuesta = await clienteAxios.get("/negocios/todos")
        setNegocios(respuesta.data.datos)
        setError(null)
      } catch (err) {
        if (err.response?.status === 403) setError("No tenés permiso para ver los comercios.")
        else setError(mensajeDeError(err, "No se pudieron cargar los comercios."))
      } finally {
        setCargando(false)
      }
    }
    cargarNegocios()
  }, [])

  const reemplazar = (actualizado) =>
    setNegocios((anteriores) => anteriores.map((n) => (n.id === actualizado.id ? actualizado : n)))

  const aprobar = async (negocio) => {
    setProcesando(negocio.id)
    setErrorAccion(null)
    try {
      const respuesta = await clienteAxios.put(`/negocios/${negocio.id}/aprobacion`, { aprobado: true })
      reemplazar(respuesta.data.datos)
      avisar(`"${negocio.nombre}" aprobado: ya aparece en el catálogo.`)
    } catch (err) {
      setErrorAccion(mensajeDeError(err, "No se pudo aprobar el comercio."))
    } finally {
      setProcesando(null)
    }
  }

  // Lo llama FormRechazo; si falla, el error se muestra dentro del formulario
  const rechazar = async (negocio, motivo) => {
    const respuesta = await clienteAxios.put(`/negocios/${negocio.id}/aprobacion`, { aprobado: false, motivo })
    reemplazar(respuesta.data.datos)
    setRechazando(null)
    avisar(`"${negocio.nombre}" rechazado. El dueño va a ver el motivo.`)
  }

  const cambiarActivo = async (negocio) => {
    if (negocio.isActivo && !window.confirm(`¿Desactivar "${negocio.nombre}"? Deja de aparecer en el catálogo.`)) return

    setProcesando(negocio.id)
    setErrorAccion(null)
    try {
      const respuesta = await clienteAxios.put(`/negocios/${negocio.id}/estado`, { isActivo: !negocio.isActivo })
      reemplazar(respuesta.data.datos)
      avisar(negocio.isActivo ? `"${negocio.nombre}" desactivado.` : `"${negocio.nombre}" activado.`)
    } catch (err) {
      setErrorAccion(mensajeDeError(err, "No se pudo cambiar el estado del comercio."))
    } finally {
      setProcesando(null)
    }
  }

  if (cargando) return <Cargando texto="Cargando comercios..." />

  if (error) {
    return <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200" role="alert">{error}</p>
  }

  const texto = busqueda.trim().toLowerCase()
  const filtrados = negocios.filter((n) =>
    `${n.nombre} ${n.rubro} ${n.propietarioNombre ?? ""} ${n.propietarioEmail ?? ""}`.toLowerCase().includes(texto)
  )
  // Visible en el catalogo = aprobado, activo y con el dueño activo
  const esVisible = (n) => n.estadoAprobacion === "Aprobado" && n.isActivo && n.propietarioActivo
  const visibles = negocios.filter(esVisible).length
  const pendientes = negocios.filter((n) => n.estadoAprobacion === "Pendiente").length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-pizarra">
          {negocios.length} comercios ·{" "}
          <span className={pendientes > 0 ? "font-semibold text-amber-800" : ""}>
            {pendientes} pendientes de aprobación
          </span>{" "}
          · {visibles} visibles en el catálogo
        </p>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, rubro o dueño"
          aria-label="Buscar comercios"
          className="w-full sm:w-72 rounded-lg border border-borde bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya"
        />
      </div>

      {errorAccion && <p className="mb-4 text-sm text-red-700" role="alert">{errorAccion}</p>}

      {filtrados.length === 0 ? (
        <p className="text-pizarra">
          {negocios.length === 0 ? "Todavía no hay comercios registrados." : "No hay comercios que coincidan con la búsqueda."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtrados.map((negocio) => {
            const visible = esVisible(negocio)
            const serviciosActivos = negocio.servicios.filter((s) => s.isActivo).length
            const etiqueta = ETIQUETA_APROBACION[negocio.estadoAprobacion]
            const ocupado = procesando === negocio.id
            return (
              <li
                key={negocio.id}
                className={`flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border ${
                  negocio.estadoAprobacion === "Pendiente" ? "border-amber-300" : "border-borde"
                }`}
              >
                <div className={`min-w-0 ${visible || negocio.estadoAprobacion === "Pendiente" ? "" : "opacity-60"}`}>
                  {/* Al tocar el nombre se despliega el resumen para analizar el comercio */}
                  <button
                    type="button"
                    onClick={() => setAbierto(abierto === negocio.id ? null : negocio.id)}
                    aria-expanded={abierto === negocio.id}
                    className="text-left font-semibold hover:text-ya-texto"
                  >
                    {negocio.nombre} <span className="font-normal text-pizarra">· {negocio.rubro}</span>
                    <span className="ml-2 text-sm font-medium text-ya-texto">
                      {abierto === negocio.id ? "▴ Ocultar resumen" : "▾ Ver resumen"}
                    </span>
                  </button>
                  <p className="text-sm text-pizarra break-all">
                    Dueño: {negocio.propietarioNombre} ({negocio.propietarioEmail})
                    {!negocio.propietarioActivo && <span className="text-red-700"> · dado de baja</span>}
                  </p>
                  <p className="text-xs text-pizarra">
                    {serviciosActivos === 1 ? "1 servicio activo" : `${serviciosActivos} servicios activos`}
                  </p>
                  {negocio.estadoAprobacion === "Rechazado" && negocio.motivoRechazo && (
                    <p className="mt-1 text-sm text-red-700">Motivo: {negocio.motivoRechazo}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {etiqueta && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${etiqueta.clase}`}>{etiqueta.texto}</span>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      negocio.isActivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {negocio.isActivo ? "Activo" : "Inactivo"}
                  </span>
                  {negocio.isActivo && !negocio.propietarioActivo && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                      Oculto (dueño de baja)
                    </span>
                  )}
                  {visible && (
                    <Link href={`/negocios/${negocio.id}`} className="text-sm font-medium text-ya-texto hover:underline">
                      Ver en el catálogo
                    </Link>
                  )}

                  {/* Moderacion: aprobar los pendientes o rechazados, rechazar los pendientes */}
                  {negocio.estadoAprobacion !== "Aprobado" && (
                    <button
                      type="button"
                      onClick={() => aprobar(negocio)}
                      disabled={ocupado}
                      className="text-sm px-3 py-1 rounded-lg bg-ya text-turno font-semibold transition hover:brightness-95 disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                  )}
                  {negocio.estadoAprobacion === "Pendiente" && rechazando !== negocio.id && (
                    <button type="button" onClick={() => setRechazando(negocio.id)} disabled={ocupado} className={claseBoton}>
                      Rechazar
                    </button>
                  )}
                  <button type="button" onClick={() => cambiarActivo(negocio)} disabled={ocupado} className={claseBoton}>
                    {negocio.isActivo ? "Desactivar" : "Activar"}
                  </button>
                </div>

                {abierto === negocio.id && <ResumenComercio negocio={negocio} />}

                {rechazando === negocio.id && (
                  <FormRechazo negocio={negocio} onRechazar={rechazar} onCancelar={() => setRechazando(null)} />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

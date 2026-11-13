import { useCallback, useEffect, useState } from "react"
import clienteAxios from "../../api/clienteAxios"

const FORM_VACIO = { nombre: "", descripcion: "", duracionMinutos: "", precio: "" }

// Mismas reglas que CrearServicioDTO / ActualizarServicioDTO del backend
function validar(valores) {
  const errores = {}

  const nombre = valores.nombre.trim()
  if (nombre.length < 2) errores.nombre = "El nombre debe tener al menos 2 caracteres."
  else if (nombre.length > 100) errores.nombre = "El nombre puede tener hasta 100 caracteres."

  if (valores.descripcion.length > 500) {
    errores.descripcion = "La descripción puede tener hasta 500 caracteres."
  }

  const duracion = Number(valores.duracionMinutos)
  if (valores.duracionMinutos === "" || !Number.isInteger(duracion) || duracion < 5 || duracion > 480) {
    errores.duracionMinutos = "La duración debe ser un número entero entre 5 y 480 minutos."
  }

  const precio = Number(valores.precio)
  if (valores.precio === "" || Number.isNaN(precio) || precio < 0) {
    errores.precio = "El precio debe ser un número mayor o igual a 0."
  }

  return errores
}

function Campo({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600 mt-1">{error}</span>}
    </label>
  )
}

const claseInput = "mt-1 w-full rounded-lg border border-borde px-3 py-2 bg-white"

function FormularioServicio({ servicio, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(
    servicio
      ? {
          nombre: servicio.nombre,
          descripcion: servicio.descripcion ?? "",
          duracionMinutos: String(servicio.duracionMinutos),
          precio: String(servicio.precio),
        }
      : FORM_VACIO
  )
  const [errores, setErrores] = useState({})
  const [errorApi, setErrorApi] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    const nuevosErrores = validar(valores)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setGuardando(true)
    setErrorApi(null)
    try {
      await onGuardar({
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim() || null,
        duracionMinutos: Number(valores.duracionMinutos),
        precio: Number(valores.precio),
      })
    } catch (err) {
      setErrorApi(err.response?.data?.mensaje ?? "No se pudo guardar el servicio.")
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="p-4 mb-6 bg-white rounded-xl border border-borde space-y-4">
      <h3 className="font-semibold">{servicio ? "Editar servicio" : "Nuevo servicio"}</h3>

      <Campo label="Nombre" error={errores.nombre}>
        <input name="nombre" value={valores.nombre} onChange={cambiar} className={claseInput} />
      </Campo>

      <Campo label="Descripción (opcional)" error={errores.descripcion}>
        <textarea name="descripcion" value={valores.descripcion} onChange={cambiar} rows={2} className={claseInput} />
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Duración (minutos)" error={errores.duracionMinutos}>
          <input name="duracionMinutos" type="number" value={valores.duracionMinutos} onChange={cambiar} className={claseInput} />
        </Campo>
        <Campo label="Precio ($)" error={errores.precio}>
          <input name="precio" type="number" step="0.01" value={valores.precio} onChange={cambiar} className={claseInput} />
        </Campo>
      </div>

      {errorApi && <p className="text-sm text-red-600">{errorApi}</p>}

           <div className="flex gap-2">
        <button type="submit" disabled={guardando} className="px-4 py-2 rounded-lg bg-ya font-semibold transition hover:brightness-110 active:brightness-90 active:scale-95 disabled:opacity-50">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={onCancelar} className="px-4 py-2 rounded-lg border border-borde transition hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function ServiciosNegocio({ negocioId }) {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)
  // null = formulario cerrado, "nuevo" = crear, un servicio = editar ese servicio
  const [editando, setEditando] = useState(null)

  const cargarServicios = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await clienteAxios.get(`/negocios/${negocioId}/servicios`)
      setServicios(respuesta.data.datos)
    } catch (err) {
      const status = err.response?.status
      if (status === 404) setError("El negocio no existe.")
      else if (status === 403) setError("No tenés permiso para ver este negocio.")
      else setError("No se pudieron cargar los servicios.")
    } finally {
      setCargando(false)
    }
  }, [negocioId])

  useEffect(() => {
    cargarServicios()
  }, [cargarServicios])

  // B1: crear (POST) o editar (PUT) según lo que se esté editando
  const guardarServicio = async (datos) => {
    if (editando === "nuevo") {
      await clienteAxios.post(`/negocios/${negocioId}/servicios`, datos)
    } else {
      await clienteAxios.put(`/servicios/${editando.id}`, datos)
    }
    setEditando(null)
    cargarServicios()
  }

  // B2: activar / desactivar con el mismo PUT, mandando solo isActivo
  const cambiarActivo = async (servicio) => {
    setErrorAccion(null)
    try {
      await clienteAxios.put(`/servicios/${servicio.id}`, { isActivo: !servicio.isActivo })
      cargarServicios()
    } catch {
      setErrorAccion("No se pudo cambiar el estado del servicio.")
    }
  }

  if (cargando) return <p className="text-pizarra">Cargando servicios...</p>

  if (error) {
    return <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Servicios</h2>
        {!editando && (
           <button onClick={() => setEditando("nuevo")} className="px-4 py-2 rounded-lg bg-ya font-semibold transition hover:brightness-110 active:brightness-90 active:scale-95">
             + Nuevo servicio
            </button>
        )}
      </div>

      {editando && (
        <FormularioServicio
          key={editando === "nuevo" ? "nuevo" : editando.id}
          servicio={editando === "nuevo" ? null : editando}
          onGuardar={guardarServicio}
          onCancelar={() => setEditando(null)}
        />
      )}

      {errorAccion && <p className="mb-4 text-sm text-red-600">{errorAccion}</p>}

      {servicios.length === 0 ? (
        <p className="text-pizarra">Este negocio todavía no tiene servicios.</p>
      ) : (
        <ul className="space-y-3">
          {servicios.map((servicio) => (
            <li
              key={servicio.id}
              className={`flex items-center justify-between p-4 bg-white rounded-xl border border-borde ${
                servicio.isActivo ? "" : "opacity-60"
              }`}
            >
              <div>
                <p className="font-semibold">{servicio.nombre}</p>
                {servicio.descripcion && <p className="text-sm text-pizarra">{servicio.descripcion}</p>}
                <p className="text-sm text-pizarra">
                  {servicio.duracionMinutos} min · ${Number(servicio.precio).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    servicio.isActivo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {servicio.isActivo ? "Activo" : "Inactivo"}
                </span>
                <button onClick={() => setEditando(servicio)} className="text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-gray-100">
                  Editar
                </button>
                <button onClick={() => cambiarActivo(servicio)} className="text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-gray-100">
                  {servicio.isActivo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
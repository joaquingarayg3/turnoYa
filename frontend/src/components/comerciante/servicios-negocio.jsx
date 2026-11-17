import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clienteAxios from "../../api/clienteAxios"
import { esquemaServicio } from "../../schemas/servicio-schemas"
import { mensajeDeError } from "../../utils/errores"
import Campo from "../campo"
import Cargando from "../cargando"

function FormularioServicio({ servicio, onGuardar, onCancelar }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaServicio),
    defaultValues: servicio
      ? {
          nombre: servicio.nombre,
          descripcion: servicio.descripcion ?? "",
          duracionMinutos: servicio.duracionMinutos,
          precio: servicio.precio,
        }
      : { nombre: "", descripcion: "" },
  })

  const enviar = async (datos) => {
    try {
      // La descripcion se manda siempre como texto: "" borra la anterior al editar
      // (null el back lo interpreta como "no cambiar")
      await onGuardar(datos)
    } catch (err) {
      setError("root", { message: mensajeDeError(err, "No se pudo guardar el servicio.") })
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="p-4 mb-6 bg-white rounded-xl border border-borde space-y-4" noValidate>
      <h3 className="font-semibold">{servicio ? "Editar servicio" : "Nuevo servicio"}</h3>

      <Campo id="nombre" label="Nombre" error={errors.nombre} {...register("nombre")} />

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium mb-1">Descripción (opcional)</label>
        <textarea
          id="descripcion"
          rows={2}
          className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya ${
            errors.descripcion ? "border-red-600" : "border-borde"
          }`}
          {...register("descripcion")}
        />
        {errors.descripcion && <p className="mt-1 text-sm text-red-700">{errors.descripcion.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Campo
          id="duracionMinutos"
          label="Duración (minutos)"
          type="number"
          ayuda="Múltiplo del intervalo de turnos del negocio (por defecto, 30 min)."
          error={errors.duracionMinutos}
          {...register("duracionMinutos", { valueAsNumber: true })}
        />
        <Campo
          id="precio"
          label="Precio ($)"
          type="number"
          step="0.01"
          error={errors.precio}
          {...register("precio", { valueAsNumber: true })}
        />
      </div>

      {errors.root && <p className="text-sm text-red-700" role="alert">{errors.root.message}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-ya text-turno font-semibold transition hover:brightness-95 active:scale-95 disabled:opacity-50">
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={onCancelar} className="px-4 py-2 rounded-lg border border-borde transition hover:bg-fondo">
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
  // Al cambiar este numero se vuelven a pedir los servicios
  const [recarga, setRecarga] = useState(0)

  // Patron del modulo 08: la funcion async se define dentro del efecto
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setCargando(true)
        const respuesta = await clienteAxios.get(`/negocios/${negocioId}/servicios`)
        setServicios(respuesta.data.datos)
        setError(null)
      } catch (err) {
        const status = err.response?.status
        if (status === 404) setError("El negocio no existe.")
        else if (status === 403) setError("No tenés permiso para ver este negocio.")
        else setError(mensajeDeError(err, "No se pudieron cargar los servicios."))
      } finally {
        setCargando(false)
      }
    }
    cargarServicios()
  }, [negocioId, recarga])

  // B1: crear (POST) o editar (PUT) según lo que se esté editando
  const guardarServicio = async (datos) => {
    if (editando === "nuevo") {
      await clienteAxios.post(`/negocios/${negocioId}/servicios`, datos)
    } else {
      await clienteAxios.put(`/servicios/${editando.id}`, datos)
    }
    setEditando(null)
    setRecarga((n) => n + 1)
  }

  // B2: activar / desactivar con el mismo PUT, mandando solo isActivo
  const cambiarActivo = async (servicio) => {
    setErrorAccion(null)
    try {
      await clienteAxios.put(`/servicios/${servicio.id}`, { isActivo: !servicio.isActivo })
      setRecarga((n) => n + 1)
    } catch (err) {
      setErrorAccion(mensajeDeError(err, "No se pudo cambiar el estado del servicio."))
    }
  }

  if (cargando) return <Cargando texto="Cargando servicios..." />

  if (error) {
    return <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Servicios</h2>
        {!editando && (
          <button onClick={() => setEditando("nuevo")} className="px-4 py-2 rounded-lg bg-ya text-turno font-semibold transition hover:brightness-95 active:scale-95">
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

      {errorAccion && <p className="mb-4 text-sm text-red-700">{errorAccion}</p>}

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
                <button onClick={() => setEditando(servicio)} className="text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-fondo">
                  Editar
                </button>
                <button onClick={() => cambiarActivo(servicio)} className="text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-fondo">
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

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "wouter"
import clienteAxios from "../../api/clienteAxios"
import Cargando from "../../components/cargando"
import { esquemaBusqueda } from "../../schemas/catalogo-schemas"
import { mensajeDeError } from "../../utils/errores"

const SIN_FILTROS = { busqueda: "", rubro: "" }

// "3 servicios · desde $8.000"
function resumenServicios(servicios) {
  if (servicios.length === 0) return "Sin servicios por ahora"
  const desde = Math.min(...servicios.map((servicio) => Number(servicio.precio)))
  const cantidad = servicios.length === 1 ? "1 servicio" : `${servicios.length} servicios`
  return `${cantidad} · desde $${desde.toLocaleString("es-AR")}`
}

function TarjetaNegocio({ negocio }) {
  return (
    <li>
      <Link
        href={`/negocios/${negocio.id}`}
        className="flex h-full flex-col p-5 bg-white rounded-2xl border border-borde transition hover:border-ya hover:shadow-sm"
      >
        <span className="self-start text-xs font-medium px-2 py-1 rounded-full bg-fondo text-pizarra border border-borde">
          {negocio.rubro}
        </span>
        <h2 className="mt-3 text-lg font-bold">{negocio.nombre}</h2>
        {negocio.descripcion && <p className="mt-1 text-sm text-pizarra line-clamp-2">{negocio.descripcion}</p>}
        {negocio.direccion && <p className="mt-2 text-sm text-pizarra">{negocio.direccion}</p>}
        <div className="mt-auto pt-4 flex items-center justify-between gap-2 text-sm">
          <span className="text-pizarra">{resumenServicios(negocio.servicios)}</span>
          <span className="font-semibold text-ya-texto whitespace-nowrap">Ver turnos →</span>
        </div>
      </Link>
    </li>
  )
}

// D5 · GET /api/catalogo/negocios?busqueda=&rubro=  y  GET /api/catalogo/rubros
// Pagina de inicio y publica: cualquiera puede buscar negocios (para reservar si hace falta login).
export default function Catalogo() {
  const [negocios, setNegocios] = useState([])
  const [rubros, setRubros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  // Filtros aplicados: cambian al enviar el buscador y disparan una nueva busqueda
  const [filtros, setFiltros] = useState(SIN_FILTROS)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(esquemaBusqueda), defaultValues: SIN_FILTROS })

  // Rubros para el filtro: se piden una sola vez. Si fallan, el filtro queda en "Todos los rubros".
  useEffect(() => {
    const cargarRubros = async () => {
      try {
        const respuesta = await clienteAxios.get("/catalogo/rubros")
        setRubros(respuesta.data.datos)
      } catch {
        setRubros([])
      }
    }
    cargarRubros()
  }, [])

  // Patron del modulo 08: la funcion async se define dentro del efecto.
  // Se vuelve a ejecutar cada vez que cambian los filtros aplicados.
  useEffect(() => {
    const cargarNegocios = async () => {
      try {
        setCargando(true)
        // Los filtros vacios no se mandan (axios omite los undefined)
        const respuesta = await clienteAxios.get("/catalogo/negocios", {
          params: { busqueda: filtros.busqueda || undefined, rubro: filtros.rubro || undefined },
        })
        setNegocios(respuesta.data.datos)
        setError(null)
      } catch (err) {
        setError(mensajeDeError(err, "No se pudieron cargar los negocios."))
      } finally {
        setCargando(false)
      }
    }
    cargarNegocios()
  }, [filtros])

  const buscar = (datos) => setFiltros({ busqueda: datos.busqueda, rubro: datos.rubro })

  const limpiar = () => {
    reset(SIN_FILTROS)
    setFiltros(SIN_FILTROS)
  }

  const hayFiltros = filtros.busqueda !== "" || filtros.rubro !== ""

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Encontrá dónde sacar tu turno</h1>
        <p className="mt-1 text-pizarra">Buscá un negocio, elegí el servicio y reservá el horario que te quede cómodo.</p>
      </div>

      {/* Buscador: el rubro se aplica apenas se elige; el texto, al tocar Buscar o Enter */}
      <form onSubmit={handleSubmit(buscar)} className="flex flex-wrap items-start gap-3 mb-6" noValidate>
        <div className="flex-1 min-w-56">
          <input
            type="search"
            placeholder="Nombre o descripción del negocio"
            aria-label="Buscar negocios"
            className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya ${
              errors.busqueda ? "border-red-600" : "border-borde"
            }`}
            {...register("busqueda")}
          />
          {errors.busqueda && <p className="mt-1 text-sm text-red-700">{errors.busqueda.message}</p>}
        </div>
        <select
          aria-label="Filtrar por rubro"
          className="rounded-lg border border-borde bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya"
          {...register("rubro", { onChange: () => handleSubmit(buscar)() })}
        >
          <option value="">Todos los rubros</option>
          {rubros.map((rubro) => (
            <option key={rubro} value={rubro}>
              {rubro}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-ya text-turno font-semibold transition hover:brightness-95 active:scale-95"
        >
          Buscar
        </button>
        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="px-4 py-2 rounded-lg border border-borde transition hover:bg-fondo"
          >
            Limpiar
          </button>
        )}
      </form>

      {cargando ? (
        <Cargando texto="Buscando negocios..." />
      ) : error ? (
        <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200" role="alert">
          {error}
        </p>
      ) : negocios.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-borde">
          <p className="text-pizarra">
            {hayFiltros ? "No encontramos negocios con esa búsqueda." : "Todavía no hay negocios publicados."}
          </p>
          {hayFiltros && (
            <button type="button" onClick={limpiar} className="mt-3 font-medium text-ya-texto hover:underline">
              Ver todos los negocios
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-pizarra">
            {negocios.length === 1 ? "1 negocio" : `${negocios.length} negocios`}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {negocios.map((negocio) => (
              <TarjetaNegocio key={negocio.id} negocio={negocio} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

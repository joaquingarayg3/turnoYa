import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "wouter"
import clienteAxios from "../../api/clienteAxios"
import { TarjetasEsqueleto } from "../../components/esqueleto"
import PortadaNegocio, { IconoRubro } from "../../components/portada-negocio"
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
        className="flex h-full flex-col overflow-hidden bg-white rounded-2xl border border-borde transition hover:border-ya hover:shadow-sm"
      >
        <PortadaNegocio rubro={negocio.rubro} imagen={negocio.bannerUrl} alto="h-24" />
        <div className="flex flex-1 flex-col p-5">
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
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(esquemaBusqueda), defaultValues: SIN_FILTROS })

  // Rubros con negocios publicados, para los botones de filtro. Si fallan, no se muestran.
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

  // Al tocar un rubro se aplica enseguida, junto con el texto que haya en el buscador
  const elegirRubro = (rubro) => {
    setValue("rubro", rubro)
    handleSubmit(buscar)()
  }

  const claseChip = (activo) =>
    `shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
      activo ? "border-turno bg-turno text-white" : "border-borde bg-white text-turno hover:border-ya"
    }`

  return (
    <section>
      {/* Portada del catalogo con el buscador */}
      <div
        className="relative overflow-hidden rounded-3xl bg-turno px-6 py-10 sm:px-10 sm:py-14 mb-6"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      >
        <p className="text-sm font-semibold text-ya">Pedí tu turno, ya.</p>
        <h1 className="mt-2 max-w-xl text-3xl font-bold text-white sm:text-4xl">Encontrá dónde sacar tu turno</h1>
        <p className="mt-2 max-w-xl text-borde">Buscá un negocio, elegí el servicio y reservá el horario que te quede cómodo.</p>

        {/* Buscador: el texto se aplica al tocar Buscar o Enter; el rubro, apenas se elige */}
        <form onSubmit={handleSubmit(buscar)} className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row" noValidate>
          <div className="flex-1">
            <input
              type="search"
              placeholder="Nombre o descripción del negocio"
              aria-label="Buscar negocios"
              className={`w-full rounded-xl border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ya ${
                errors.busqueda ? "border-red-600" : "border-transparent"
              }`}
              {...register("busqueda")}
            />
            {errors.busqueda && <p className="mt-1 text-sm text-red-200">{errors.busqueda.message}</p>}
          </div>
          <input type="hidden" {...register("rubro")} />
          <button
            type="submit"
            className="rounded-xl bg-ya-texto active:bg-ya px-6 py-3 font-semibold text-white transition hover:bg-ya active:scale-95"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Rubros como botones con su icono: en el celular se deslizan de costado */}
      {rubros.length > 0 && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0" aria-label="Filtrar por rubro">
          <button type="button" onClick={() => elegirRubro("")} className={claseChip(filtros.rubro === "")}>
            Todos
          </button>
          {rubros.map((rubro) => (
            <button
              key={rubro}
              type="button"
              onClick={() => elegirRubro(rubro)}
              aria-pressed={filtros.rubro === rubro}
              className={claseChip(filtros.rubro === rubro)}
            >
              <IconoRubro rubro={rubro} className="h-4 w-4" />
              {rubro}
            </button>
          ))}
        </div>
      )}

      {hayFiltros && (
        <button type="button" onClick={limpiar} className="mb-4 text-sm font-medium text-ya-texto hover:underline">
          Limpiar filtros
        </button>
      )}

      {cargando ? (
        <TarjetasEsqueleto />
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

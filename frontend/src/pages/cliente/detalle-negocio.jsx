import { useEffect, useState } from "react"
import { Link, useParams } from "wouter"
import clienteAxios from "../../api/clienteAxios"
import Cargando from "../../components/cargando"
import { DIAS_SEMANA, horaCorta } from "../../utils/dias"
import { mensajeDeError } from "../../utils/errores"

// D6 · GET /api/catalogo/negocios/{id}
// Datos del negocio, sus servicios activos y sus horarios de atencion. Es publica (sin login).
export default function DetalleNegocio() {
  const { id } = useParams()
  const [negocio, setNegocio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Patron del modulo 08: la funcion async se define dentro del efecto
  useEffect(() => {
    const cargarNegocio = async () => {
      try {
        setCargando(true)
        const respuesta = await clienteAxios.get(`/catalogo/negocios/${id}`)
        setNegocio(respuesta.data.datos)
        setError(null)
      } catch (err) {
        if (err.response?.status === 404) setError("Este negocio no existe o no está disponible.")
        else setError(mensajeDeError(err, "No se pudo cargar el negocio."))
      } finally {
        setCargando(false)
      }
    }
    cargarNegocio()
  }, [id])

  if (cargando) return <Cargando texto="Cargando negocio..." />

  if (error) {
    return (
      <section className="max-w-xl mx-auto">
        <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200" role="alert">{error}</p>
        <Link href="/" className="mt-4 inline-block font-medium text-ya-texto hover:underline">
          Volver al catálogo
        </Link>
      </section>
    )
  }

  const tieneServicios = negocio.servicios.length > 0

  return (
    <section className="space-y-6">
      <Link href="/" className="text-sm font-medium text-ya-texto hover:underline">
        ← Volver al catálogo
      </Link>

      {/* Encabezado: datos del negocio y boton para reservar */}
      <div className="flex flex-wrap items-start justify-between gap-4 p-6 bg-white rounded-2xl border border-borde">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-fondo text-pizarra border border-borde">
            {negocio.rubro}
          </span>
          <h1 className="mt-2 text-3xl font-bold">{negocio.nombre}</h1>
          {negocio.descripcion && <p className="mt-2 text-pizarra">{negocio.descripcion}</p>}
          {(negocio.direccion || negocio.telefono) && (
            <p className="mt-2 text-sm text-pizarra">
              {[negocio.direccion, negocio.telefono].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {tieneServicios && (
          <Link
            href={`/negocios/${negocio.id}/reservar`}
            className="px-5 py-2.5 rounded-lg bg-ya text-turno font-semibold transition hover:brightness-95 active:scale-95"
          >
            Reservar turno
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        {/* Servicios activos */}
        <div>
          <h2 className="mb-3 text-xl font-bold">Servicios</h2>
          {!tieneServicios ? (
            <p className="text-pizarra">Este negocio todavía no tiene servicios para reservar.</p>
          ) : (
            <ul className="space-y-3">
              {negocio.servicios.map((servicio) => (
                <li key={servicio.id} className="p-4 bg-white rounded-xl border border-borde">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold">{servicio.nombre}</p>
                    <p className="font-semibold whitespace-nowrap">
                      ${Number(servicio.precio).toLocaleString("es-AR")}
                    </p>
                  </div>
                  {servicio.descripcion && <p className="text-sm text-pizarra">{servicio.descripcion}</p>}
                  <p className="text-sm text-pizarra">{servicio.duracionMinutos} min</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Horarios de atencion, de lunes a domingo */}
        <div>
          <h2 className="mb-3 text-xl font-bold">Horarios de atención</h2>
          {negocio.horarios.length === 0 ? (
            <p className="text-pizarra">El negocio todavía no cargó sus horarios.</p>
          ) : (
            <ul className="p-4 bg-white rounded-xl border border-borde divide-y divide-borde">
              {DIAS_SEMANA.map((dia) => {
                const franjas = negocio.horarios.filter((horario) => horario.diaSemana === dia.valor)
                return (
                  <li key={dia.valor} className="flex justify-between gap-3 py-2">
                    <span className="font-medium">{dia.nombre}</span>
                    <span className={franjas.length === 0 ? "text-pizarra" : ""}>
                      {franjas.length === 0
                        ? "Cerrado"
                        : franjas
                            .map((franja) => `${horaCorta(franja.horaDesde)} a ${horaCorta(franja.horaHasta)}`)
                            .join(" · ")}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

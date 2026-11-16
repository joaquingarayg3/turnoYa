import { Link } from "wouter"
import { useEffect, useState } from "react"
import clienteAxios from '../../api/clienteAxios'
import { mensajeDeError } from '../../utils/errores'

// A1 · GET /api/negocios/mios   ·   A3 · PATCH /api/negocios/{id}/estado
export default function MisNegocios() {
  const [negocios, setNegocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null)

  useEffect(() => {
    const controlador = new AbortController(); // Para cancelar la solicitud si el componente se desmonta

    async function cargarNegocios() {
      try {
        const respuesta = await clienteAxios.get("/negocios/mios", {
          signal: controlador.signal,
        })

        setNegocios(respuesta.data.datos)
      } catch (error) {
        if (!controlador.signal.aborted) {
          setError(mensajeDeError(error))
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }


    cargarNegocios()

    return () => controlador.abort()  // Cancelar la solicitud si el componente se desmonta
  }, [])

  async function cambiarEstado(negocio) {
    setActualizandoId(negocio.id)
    setError("") // Limpiar error previo

    try {
      const respuesta = await clienteAxios.put(
        `/negocios/${negocio.id}`,
        { isActivo: !negocio.isActivo }
      )

      const negocioActualizado = respuesta.data.datos

      // Reemplaza en la lista el negocio actualizado por el backend conservando los demás y sin recargar la pagina.
      setNegocios((actuales) =>
        actuales.map((actual) =>
          actual.id === negocioActualizado.id
            ? negocioActualizado
            : actual
        )
      )
    } catch (error) {
      setError(mensajeDeError(error))
    } finally {
      setActualizandoId(null)
    }
  }

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis negocios</h1>
          <p className="mt-1 text-pizarra">
            Administrá los datos, servicios y agenda de tus negocios.
          </p>
        </div>

        <Link
          href="/mis-negocios/nuevo"
          className="inline-flex items-center justify-center self-start rounded-lg bg-ya px-5 py-3 font-semibold text-turno transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turno"
        >
          + Nuevo negocio
        </Link>
      </div>

      {cargando && <p>Cargando negocios...</p>}

      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}

      {!cargando && !error && (
        negocios.length === 0 ? (
          <p>Todavía no tenés negocios. Creá el primero</p>
        ) : (
          // Crear un componente para el listado de negocios, con la info y los links a administrar y editar
          <ul className="grid gap-4 sm:grid-cols-2">
            {negocios.map((negocio) => (
              <li
                key={negocio.id}
                className="flex flex-col rounded-2xl border border-borde bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-word text-xl font-bold">
                      {negocio.nombre}
                    </h2>

                    <p className="mt-1 text-sm text-pizarra">
                      {negocio.rubro}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${negocio.isActivo
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                      }`}
                  >
                    {negocio.isActivo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <p className="mt-4 text-sm text-pizarra">
                  {negocio.direccion || "Sin dirección registrada"}
                </p>

                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap items-center gap-3 border-t border-borde pt-4">
                    <Link
                      href={`/mis-negocios/${negocio.id}`}
                      className="rounded-lg bg-turno px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Administrar
                    </Link>

                    <Link
                      href={`/mis-negocios/${negocio.id}/editar`}
                      className="rounded-lg border border-borde px-4 py-2 text-sm font-medium transition hover:bg-fondo"
                    >
                      Editar datos
                    </Link>

                    <button
                      type="button"
                      onClick={() => cambiarEstado(negocio)}
                      disabled={actualizandoId !== null}
                      className="rounded-lg border border-borde px-4 py-2 text-sm font-medium transition hover:bg-fondo disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actualizandoId === negocio.id
                        ? "Guardando..."
                        : negocio.isActivo
                          ? "Desactivar"
                          : "Activar"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}

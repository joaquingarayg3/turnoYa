import { Link } from "wouter"
import { useEffect, useState } from "react"
import clienteAxios from '../../api/clienteAxios'
import { mensajeDeError } from '../../utils/errores'
import { useAvisos } from "../../hooks/use-avisos"
import { ListaEsqueleto } from "../../components/esqueleto"

// A1 · GET /api/negocios/mios   ·   A3 · PUT /api/negocios/{id} con { isActivo } (baja lógica)
export default function MisNegocios() {
  const [negocios, setNegocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Error al activar/desactivar: se muestra arriba de la lista sin ocultarla
  const [errorAccion, setErrorAccion] = useState("")
  const [actualizandoId, setActualizandoId] = useState(null)
  const { avisar } = useAvisos()

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
    setErrorAccion("") // Limpiar error previo

    try {
      const respuesta = await clienteAxios.put(
        `/negocios/${negocio.id}`,
        { isActivo: !negocio.isActivo }
      )

      const negocioActualizado = respuesta.data.datos
      avisar(negocioActualizado.isActivo ? "Negocio activado." : "Negocio desactivado.")

      // Reemplaza en la lista el negocio actualizado por el backend conservando los demás y sin recargar la pagina.
      setNegocios((actuales) =>
        actuales.map((actual) =>
          actual.id === negocioActualizado.id
            ? negocioActualizado
            : actual
        )
      )
    } catch (error) {
      setErrorAccion(mensajeDeError(error))
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
          className="inline-flex items-center justify-center self-start rounded-lg bg-ya-texto active:bg-ya px-5 py-3 font-semibold text-white transition hover:bg-ya focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turno"
        >
          + Nuevo negocio
        </Link>
      </div>

      {cargando && <ListaEsqueleto />}

      {error && (
        <p role="alert" className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {errorAccion && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {errorAccion}
        </p>
      )}

      {!cargando && !error && (
        negocios.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-borde">
            <p className="text-pizarra">Todavía no tenés negocios.</p>
            <Link href="/mis-negocios/nuevo" className="mt-3 inline-block font-medium text-ya-texto hover:underline">
              Crear el primero
            </Link>
          </div>
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
                    <h2 className="break-words text-xl font-bold">
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

                {/* Moderacion: un negocio nuevo espera la aprobacion de un Admin */}
                {negocio.estadoAprobacion === "Pendiente" && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Pendiente de aprobación: todavía no aparece en el catálogo.
                  </p>
                )}
                {negocio.estadoAprobacion === "Rechazado" && (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    Rechazado: {negocio.motivoRechazo}. Corregilo en "Editar datos" y vuelve a revisión.
                  </p>
                )}

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

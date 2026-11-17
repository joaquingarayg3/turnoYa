import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clienteAxios from "../../api/clienteAxios"
import { esquemaHorarios } from "../../schemas/horario-schemas"
import { DIAS_SEMANA, horaCorta } from "../../utils/dias"
import { mensajeDeError } from "../../utils/errores"
import Cargando from "../cargando"

const DIAS_HABILES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

// Del back ({ diaSemana, horaDesde: "09:00:00", ... }) al formulario ({ ..., horaDesde: "09:00" })
const aFormulario = (horario) => ({
  diaSemana: horario.diaSemana,
  horaDesde: horaCorta(horario.horaDesde),
  horaHasta: horaCorta(horario.horaHasta),
})

// GET y PUT /api/negocios/{id}/horarios
// Se edita la semana entera en un solo formulario y se guarda todo junto (el back reemplaza la semana).
// Un dia sin franjas = el negocio no atiende ese dia.
export default function HorariosNegocio({ negocioId }) {
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [guardado, setGuardado] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(esquemaHorarios), defaultValues: { franjas: [] } })

  // useFieldArray maneja la lista de franjas: agregar, quitar y reemplazar
  const { fields, append, remove, replace } = useFieldArray({ control, name: "franjas" })

  // Patron del modulo 08: la funcion async se define dentro del efecto
  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        setCargando(true)
        const respuesta = await clienteAxios.get(`/negocios/${negocioId}/horarios`)
        reset({ franjas: respuesta.data.datos.map(aFormulario) })
        setErrorCarga(null)
      } catch (err) {
        const status = err.response?.status
        if (status === 404) setErrorCarga("El negocio no existe.")
        else if (status === 403) setErrorCarga("No tenés permiso para ver este negocio.")
        else setErrorCarga(mensajeDeError(err, "No se pudieron cargar los horarios."))
      } finally {
        setCargando(false)
      }
    }
    cargarHorarios()
  }, [negocioId, reset])

  const enviar = async (datos) => {
    setGuardado(false)
    try {
      // El back espera TimeOnly con segundos: "09:00" -> "09:00:00"
      const franjas = datos.franjas.map((franja) => ({
        diaSemana: franja.diaSemana,
        horaDesde: `${franja.horaDesde}:00`,
        horaHasta: `${franja.horaHasta}:00`,
      }))
      const respuesta = await clienteAxios.put(`/negocios/${negocioId}/horarios`, franjas)
      reset({ franjas: respuesta.data.datos.map(aFormulario) })
      setGuardado(true)
    } catch (err) {
      setError("root", { message: mensajeDeError(err, "No se pudieron guardar los horarios.") })
    }
  }

  // Primera franja del dia: mañana. Si ya hay una, se propone una de tarde (horario cortado).
  const agregarFranja = (dia) => {
    const yaTiene = getValues("franjas").some((franja) => franja.diaSemana === dia)
    append(
      yaTiene
        ? { diaSemana: dia, horaDesde: "17:00", horaHasta: "21:00" }
        : { diaSemana: dia, horaDesde: "09:00", horaHasta: "13:00" }
    )
  }

  // Atajo: el horario del lunes se copia de martes a viernes (sabado y domingo no se tocan)
  const copiarLunes = () => {
    const actuales = getValues("franjas")
    const lunes = actuales.filter((franja) => franja.diaSemana === "Monday")
    const otrosDias = actuales.filter((franja) => !DIAS_HABILES.includes(franja.diaSemana))
    const copias = DIAS_HABILES.slice(1).flatMap((dia) => lunes.map((franja) => ({ ...franja, diaSemana: dia })))
    replace([...lunes, ...copias, ...otrosDias])
  }

  if (cargando) return <Cargando texto="Cargando horarios..." />

  if (errorCarga) {
    return <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{errorCarga}</p>
  }

  const claseHora = (error) =>
    `rounded-lg border bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ya ${
      error ? "border-red-600" : "border-borde"
    }`

  const hayLunes = fields.some((franja) => franja.diaSemana === "Monday")

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h2 className="text-xl font-bold">Horarios de atención</h2>
        {hayLunes && (
          <button
            type="button"
            onClick={copiarLunes}
            className="text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-fondo"
          >
            Copiar el lunes de martes a viernes
          </button>
        )}
      </div>
      <p className="mb-4 text-sm text-pizarra">
        Los clientes solo pueden reservar dentro de estas franjas, y el servicio tiene que terminar antes del cierre.
      </p>

      <ul className="space-y-3">
        {DIAS_SEMANA.map((dia) => {
          // Se conserva el indice original de cada franja: RHF lo necesita para register y remove
          const franjasDelDia = fields
            .map((campo, indice) => ({ campo, indice }))
            .filter(({ campo }) => campo.diaSemana === dia.valor)

          return (
            <li
              key={dia.valor}
              className="flex flex-wrap items-start gap-x-4 gap-y-2 p-4 bg-white rounded-xl border border-borde"
            >
              <p className="w-24 pt-1 font-semibold">{dia.nombre}</p>

              <div className="flex-1 space-y-2">
                {franjasDelDia.length === 0 && <p className="pt-1 text-pizarra">Cerrado</p>}

                {franjasDelDia.map(({ campo, indice }) => {
                  const errorFranja = errors.franjas?.[indice]
                  return (
                    <div key={campo.id}>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="time"
                          aria-label={`${dia.nombre}: apertura`}
                          className={claseHora(errorFranja?.horaDesde)}
                          {...register(`franjas.${indice}.horaDesde`)}
                        />
                        <span className="text-pizarra">a</span>
                        <input
                          type="time"
                          aria-label={`${dia.nombre}: cierre`}
                          className={claseHora(errorFranja?.horaHasta)}
                          {...register(`franjas.${indice}.horaHasta`)}
                        />
                        <button
                          type="button"
                          onClick={() => remove(indice)}
                          aria-label={`Quitar franja del ${dia.nombre}`}
                          className="text-sm px-2 py-1 rounded-lg text-pizarra transition hover:bg-fondo hover:text-red-700"
                        >
                          Quitar
                        </button>
                      </div>
                      {(errorFranja?.horaDesde || errorFranja?.horaHasta) && (
                        <p className="mt-1 text-sm text-red-700">
                          {errorFranja.horaDesde?.message ?? errorFranja.horaHasta?.message}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => agregarFranja(dia.valor)}
                className="text-sm font-medium text-ya-texto hover:underline pt-1"
              >
                + Agregar franja
              </button>
            </li>
          )
        })}
      </ul>

      {errors.root && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {errors.root.message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-ya text-turno font-semibold transition hover:brightness-95 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar horarios"}
        </button>
        {isDirty && !isSubmitting && <span className="text-sm text-pizarra">Tenés cambios sin guardar.</span>}
        {/* Al tocar algo el form vuelve a estar "sucio" y el aviso se oculta solo */}
        {guardado && !isDirty && (
          <span className="text-sm text-green-700" role="status">
            Horarios guardados.
          </span>
        )}
      </div>
    </form>
  )
}

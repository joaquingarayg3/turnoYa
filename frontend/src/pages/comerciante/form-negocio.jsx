import { Link, useLocation, useParams } from "wouter"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Campo from "../../components/campo"
import Cargando from "../../components/cargando"
import { esquemaNegocio } from "../../schemas/negocio-schemas"
import clienteAxios from "../../api/clienteAxios"
import { mensajeDeError } from "../../utils/errores"

// A2 · POST /api/negocios  y  PUT /api/negocios/{id}
// La misma pagina sirve para crear (sin id) y para editar (con id)
export default function FormNegocio() {
  const [, navegar] = useLocation()
  const { id } = useParams()
  const editando = id !== undefined
  const [cargando, setCargando] = useState(editando) // Solo cargamos si estamos editando
  const [errorCarga, setErrorCarga] = useState("")

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaNegocio), // Validaciones en src/schemas/negocio-schemas.js
    defaultValues: {
      nombre: "",
      rubro: "",
      descripcion: "",
      direccion: "",
      telefono: "",
      intervaloTurnosMinutos: 30,
      diasMaxAnticipacion: 30,
      horasToleranciaCancelacion: 2,
    },
  })

  useEffect(() => {
    if (!editando) return
    const controlador = new AbortController() //Para cancelar la solicitud si el componente se desmonta

    async function cargarNegocio() {
      try {
        const respuesta = await clienteAxios.get(`/negocios/${id}`, {
          signal: controlador.signal,
        })

        const negocio = respuesta.data.datos

        // Rellenamos el formulario con los datos del negocio
        reset({
          nombre: negocio.nombre,
          rubro: negocio.rubro,
          descripcion: negocio.descripcion ?? "",
          direccion: negocio.direccion ?? "",
          telefono: negocio.telefono ?? "",
          intervaloTurnosMinutos: negocio.intervaloTurnosMinutos,
          diasMaxAnticipacion: negocio.diasMaxAnticipacion,
          horasToleranciaCancelacion: negocio.horasToleranciaCancelacion,
        })
      } catch (error) {
        if (!controlador.signal.aborted) {
          setErrorCarga(mensajeDeError(error))
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    cargarNegocio()
    return () => controlador.abort() // Cancelar la solicitud si el componente se desmonta
  }, [id, editando, reset]) //Dependencias: id, editando y reset (para evitar advertencias de React Hook useEffect)

  async function guardar(datos) {
    try {
      const datosEnviar = {
        ...datos,
        nombre: datos.nombre.trim(),
        rubro: datos.rubro.trim(),
      }

      const respuesta = editando
        ? await clienteAxios.put(`/negocios/${id}`, datosEnviar)
        : await clienteAxios.post("/negocios", datosEnviar)

      const negocioGuardado = respuesta.data.datos

      navegar(`/mis-negocios/${negocioGuardado.id}`)
    } catch (error) {
      const erroresBackend = error.response?.data?.errors

      if (erroresBackend) {
        const campos = Object.keys(datos)
        let hayErroresDeCampo = false

        for (const [nombre, mensajes] of Object.entries(erroresBackend)) {
          const campo = campos.find(
            (campo) => campo.toLowerCase() === nombre.toLowerCase()
          )

          if (campo) {
            setError(campo, {
              type: "server",
              message: Array.isArray(mensajes)
                ? mensajes.join(" ")
                : String(mensajes),
            })

            hayErroresDeCampo = true
          }
        }
        if (hayErroresDeCampo) return
      }

      setError("root", {
        message: mensajeDeError(error),
      })
    }
  }

  if (cargando) {
    return <Cargando texto="Cargando datos del negocio..." />
  }
  if (errorCarga) {
    return (
      <section className="max-w-xl mx-auto">
        <p role="alert" className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {errorCarga}
        </p>
        <Link href="/mis-negocios" className="mt-4 inline-block font-medium text-ya-texto hover:underline">
          Volver a mis negocios
        </Link>
      </section>
    )
  }

  return (
    <section className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {editando ? "Editar negocio" : "Nuevo negocio"}
      </h1>

      <form
        onSubmit={handleSubmit(guardar)}
        className="flex flex-col gap-4"
        noValidate
      >

        <Campo
          id="nombre"
          label="Nombre"
          error={errors.nombre}
          {...register("nombre")}
        />

        <Campo
          id="rubro"
          label="Rubro"
          error={errors.rubro}
          {...register("rubro")}
        />

        <Campo
          id="descripcion"
          label="Descripción"
          error={errors.descripcion}
          {...register("descripcion")}
        />

        <Campo
          id="direccion"
          label="Dirección"
          error={errors.direccion}
          {...register("direccion")}
        />

        <Campo
          id="telefono"
          label="Teléfono"
          type="tel"
          error={errors.telefono}
          {...register("telefono")}
        />

        <Campo
          id="intervaloTurnosMinutos"
          label="Intervalo entre turnos (minutos)"
          type="number"
          ayuda="Cada cuántos minutos puede empezar un turno. La duración de los servicios tiene que ser múltiplo de este valor."
          error={errors.intervaloTurnosMinutos}
          {...register("intervaloTurnosMinutos", { valueAsNumber: true })}
        />

        <Campo
          id="diasMaxAnticipacion"
          label="Anticipación máxima para reservar (días)"
          type="number"
          error={errors.diasMaxAnticipacion}
          {...register("diasMaxAnticipacion", { valueAsNumber: true })}
        />

        <Campo
          id="horasToleranciaCancelacion"
          label="Anticipación mínima para cancelar (horas)"
          type="number"
          error={errors.horasToleranciaCancelacion}
          {...register("horasToleranciaCancelacion", { valueAsNumber: true })}
        />

        {errors.root && (
          <p role="alert" className="text-sm text-red-700">
            {errors.root.message}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-ya px-4 py-2 font-semibold text-turno transition hover:brightness-95 disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : "Guardar negocio"}
          </button>
          <Link
            href={editando ? `/mis-negocios/${id}` : "/mis-negocios"}
            className="font-medium text-ya-texto hover:underline"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  )
}

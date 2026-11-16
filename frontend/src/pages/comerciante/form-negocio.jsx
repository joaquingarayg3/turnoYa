import { useLocation, useParams } from "wouter"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Campo from "../../components/campo"
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
    return <p>Cargando datos del negocio...</p>
  }
  if (errorCarga) {
    return (
      <p role="alert" className="text-red-700">
        {errorCarga}
      </p>
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
          {...register("nombre", {
            required: "El nombre es obligatorio",
            validate: (valor) =>
              valor.trim().length >= 2 || "Ingresá al menos 2 caracteres",
            maxLenght: {
              value: 100,
              message: "Máximo 100 caracteres",
            },
          })}
        />

        <Campo
          id="rubro"
          label="Rubro"
          error={errors.rubro}
          {...register("rubro", {
            required: "El rubro es obligatorio",
            validate: (valor) =>
              valor.trim().length >= 2 || "Ingresá al menos 2 caracteres",
            maxLenght: {
              value: 60,
              message: "Máximo 60 caracteres",
            }
          })}
        />

        <Campo
          id="descripcion"
          label="Descripción"
          error={errors.descripcion}
          {...register("descripcion", {
            maxLength: {
              value: 500,
              message: "Máximo 500 caracteres",
            },
          })}
        />

        <Campo
          id="direccion"
          label="Dirección"
          error={errors.direccion}
          {...register("direccion", {
            maxLength: {
              value: 150,
              message: "Máximo 150 caracteres",
            },
          })}
        />

        <Campo
          id="telefono"
          label="Teléfono"
          type="tel"
          error={errors.telefono}
          {...register("telefono", {
            maxLength: {
              value: 30,
              message: "Máximo 30 caracteres",
            },
          })}
        />

        <Campo
          id="intervaloTurnosMinutos"
          label="Intervalo entre turnos (minutos)"
          type="number"
          error={errors.intervaloTurnosMinutos}
          {...register("intervaloTurnosMinutos", {
            valueAsNumber: true,
            required: "Ingresá el intervalo",
            min: { value: 5, message: "Mínimo 5 minutos" },
            max: { value: 240, message: "Máximo 240 minutos" },
            validate: (valor) =>
              Number.isInteger(valor) || "Ingresá un número entero",
          })}
        />

        <Campo
          id="diasMaxAnticipacion"
          label="Anticipación máxima para reservar (días)"
          type="number"
          error={errors.diasMaxAnticipacion}
          {...register("diasMaxAnticipacion", {
            valueAsNumber: true,
            required: "Ingresá la anticipación máxima",
            min: { value: 1, message: "Mínimo 1 día" },
            max: { value: 365, message: "Máximo 365 días" },
            validate: (valor) =>
              Number.isInteger(valor) || "Ingresá un número entero",
          })}
        />

        <Campo
          id="horasToleranciaCancelacion"
          label="Anticipación mínima para cancelar (horas)"
          type="number"
          error={errors.horasToleranciaCancelacion}
          {...register("horasToleranciaCancelacion", {
            valueAsNumber: true,
            required: "Ingresá la tolerancia de cancelación",
            min: { value: 0, message: "Mínimo 0 horas" },
            max: { value: 168, message: "Máximo 168 horas" },
            validate: (valor) =>
              Number.isInteger(valor) || "Ingresá un número entero",
          })}
        />

        {errors.root && (
          <p role="alert" className="text-sm text-red-700">
            {errors.root.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-ya px-4 py-2 font-semibold text-turno disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar negocio"}
        </button>
      </form>
    </section>
  )
}

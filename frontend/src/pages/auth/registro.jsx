import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, Redirect, useLocation } from "wouter"
import { useAuth } from "../../hooks/use-auth"
import { esquemaRegistro } from "../../schemas/auth-schemas"
import { mensajeDeError } from "../../utils/errores"
import Campo from "../../components/campo"
import { Isotipo } from "../../components/logo"

// D4 · POST /api/auth/register (y despues login automatico)
export default function Registro() {
  const { usuario, registrar } = useAuth()
  const [, navegar] = useLocation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquemaRegistro) })

  if (usuario) return <Redirect to="/" />

  const onSubmit = async (datos) => {
    try {
      // confirmarClave solo sirve en el front: al back van los campos de CrearUsuarioDTO.
      // El telefono vacio no se manda.
      await registrar({
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        clave: datos.clave,
        telefono: datos.telefono || undefined,
      })
      navegar("/")
    } catch (error) {
      setError("root", { message: mensajeDeError(error) })
    }
  }

  return (
    <section className="max-w-lg mx-auto">
      <div className="rounded-2xl border border-borde bg-white p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Isotipo size={48} />
          <h1 className="mt-4 text-3xl font-bold">Crear cuenta</h1>
          <p className="mt-1 text-pizarra">Con una sola cuenta sacás turnos y también podés publicar tu negocio.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="nombre" label="Nombre" autoComplete="given-name" error={errors.nombre} {...register("nombre")} />
            <Campo id="apellido" label="Apellido" autoComplete="family-name" error={errors.apellido} {...register("apellido")} />
          </div>
          <Campo id="email" label="Email" type="email" autoComplete="email" error={errors.email} {...register("email")} />
          <Campo
            id="telefono"
            label="Teléfono (opcional)"
            type="tel"
            autoComplete="tel"
            ayuda="Lo ve el negocio cuando reservás un turno."
            error={errors.telefono}
            {...register("telefono")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="clave" label="Clave" type="password" autoComplete="new-password" error={errors.clave} {...register("clave")} />
            <Campo
              id="confirmarClave"
              label="Repetir clave"
              type="password"
              autoComplete="new-password"
              error={errors.confirmarClave}
              {...register("confirmarClave")}
            />
          </div>

          {errors.root && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700" role="alert">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 px-4 py-2.5 rounded-lg font-semibold bg-ya text-turno hover:brightness-95 disabled:opacity-60"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-pizarra">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-ya-texto hover:underline">Ingresá</Link>
        </p>
      </div>
    </section>
  )
}

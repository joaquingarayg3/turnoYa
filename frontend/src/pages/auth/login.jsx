import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, Redirect, useLocation } from "wouter"
import { useAuth } from "../../hooks/use-auth"
import { esquemaLogin } from "../../schemas/auth-schemas"
import { mensajeDeError } from "../../utils/errores"
import Campo from "../../components/campo"
import { Isotipo } from "../../components/logo"

// D4 · POST /api/auth/login
export default function Login() {
  const { usuario, login } = useAuth()
  const [, navegar] = useLocation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquemaLogin) })

  // Si ya hay sesion, no tiene sentido ver el login
  if (usuario) return <Redirect to="/" />

  const onSubmit = async (datos) => {
    try {
      await login(datos.email, datos.clave)
      navegar("/")
    } catch (error) {
      // "root" = error general del formulario, no de un campo puntual
      setError("root", { message: mensajeDeError(error) })
    }
  }

  return (
    <section className="max-w-md mx-auto">
      <div className="rounded-2xl border border-borde bg-white p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Isotipo size={48} />
          <h1 className="mt-4 text-3xl font-bold">Ingresar</h1>
          <p className="mt-1 text-pizarra">Entrá para sacar turnos o gestionar tu negocio.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Campo id="email" label="Email" type="email" autoComplete="email" error={errors.email} {...register("email")} />
          <Campo id="clave" label="Clave" type="password" autoComplete="current-password" error={errors.clave} {...register("clave")} />

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
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-pizarra">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-medium text-ya-texto hover:underline">Creá una</Link>
        </p>
      </div>
    </section>
  )
}

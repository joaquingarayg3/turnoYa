import { useState } from "react"
import { Link } from "wouter"
import { useAuth } from "../../hooks/use-auth"
import UsuariosAdmin from "../../components/admin/usuarios-admin"
import NegociosAdmin from "../../components/admin/negocios-admin"

// Panel del staff (rol Admin). La ruta ya exige login (RutaPrivada) y aca se exige el rol.
// El backend igual lo valida: los endpoints tienen [Authorize(Roles = "Admin")] y responden 403.
export default function PanelAdmin() {
  const { esAdmin } = useAuth()
  const [pestana, setPestana] = useState("usuarios")

  if (!esAdmin) {
    return (
      <section className="max-w-xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold">No tenés permiso para ver esta página</h1>
        <p className="mt-2 text-pizarra">El panel de administración es solo para el staff de TurnoYa.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-ya-texto hover:underline">
          Volver al catálogo
        </Link>
      </section>
    )
  }

  const clasePestana = (nombre) =>
    `px-4 py-2 text-sm font-medium border-b-2 ${
      pestana === nombre ? "border-ya text-turno" : "border-transparent text-pizarra hover:text-turno"
    }`

  return (
    <section>
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      <p className="mt-1 mb-4 text-pizarra">Usuarios, roles y comercios de toda la plataforma.</p>

      <div className="flex border-b border-borde mb-6">
        <button type="button" className={clasePestana("usuarios")} onClick={() => setPestana("usuarios")}>Usuarios</button>
        <button type="button" className={clasePestana("comercios")} onClick={() => setPestana("comercios")}>Comercios</button>
      </div>

      {pestana === "usuarios" && <UsuariosAdmin />}
      {pestana === "comercios" && <NegociosAdmin />}
    </section>
  )
}

import { useEffect, useState } from "react"
import clienteAxios from "../../api/clienteAxios"
import { useAuth } from "../../hooks/use-auth"
import { mensajeDeError } from "../../utils/errores"
import { useAvisos } from "../../hooks/use-avisos"
import Cargando from "../cargando"

const claseBoton =
  "text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-fondo disabled:opacity-50 disabled:cursor-not-allowed"

// GET /api/usuarios, GET /api/usuarios/roles
// PUT /api/auth/roles/{id} (dar o quitar Admin) y PUT /api/usuarios/{id}/estado (baja logica)
export default function UsuariosAdmin() {
  const { usuario: yo } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)
  const [procesando, setProcesando] = useState(null) // id del usuario que se esta modificando
  const [busqueda, setBusqueda] = useState("")
  const { avisar } = useAvisos()

  // Patron del modulo 08: la funcion async se define dentro del efecto
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        // Los dos pedidos salen a la vez
        const [respuestaUsuarios, respuestaRoles] = await Promise.all([
          clienteAxios.get("/usuarios"),
          clienteAxios.get("/usuarios/roles"),
        ])
        setUsuarios(respuestaUsuarios.data.datos)
        setRoles(respuestaRoles.data.datos)
        setError(null)
      } catch (err) {
        if (err.response?.status === 403) setError("No tenés permiso para ver los usuarios.")
        else setError(mensajeDeError(err, "No se pudieron cargar los usuarios."))
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  // Reemplaza en la lista al usuario que devolvio el back, sin volver a pedir todo
  const reemplazar = (actualizado) =>
    setUsuarios((anteriores) => anteriores.map((u) => (u.id === actualizado.id ? actualizado : u)))

  // accion = el pedido al back; mensaje = el aviso de exito
  const ejecutar = async (usuario, accion, mensaje) => {
    setProcesando(usuario.id)
    setErrorAccion(null)
    try {
      const respuesta = await accion()
      reemplazar(respuesta.data.datos)
      avisar(mensaje)
    } catch (err) {
      setErrorAccion(mensajeDeError(err, "No se pudo actualizar el usuario."))
    } finally {
      setProcesando(null)
    }
  }

  const cambiarAdmin = (usuario) => {
    const esAdmin = usuario.roles.includes("Admin")
    const texto = esAdmin
      ? `¿Quitarle el rol Admin a ${usuario.nombre} ${usuario.apellido}?`
      : `¿Darle el rol Admin a ${usuario.nombre} ${usuario.apellido}? Va a poder administrar toda la plataforma.`
    if (!window.confirm(texto)) return

    // El back recibe la lista completa de roles: se agrega o se saca Admin y se mantiene User
    const nombres = esAdmin ? usuario.roles.filter((r) => r !== "Admin") : [...usuario.roles, "Admin"]
    const rolesIds = roles.filter((rol) => nombres.includes(rol.nombre) || rol.nombre === "User").map((rol) => rol.id)

    ejecutar(
      usuario,
      () => clienteAxios.put(`/auth/roles/${usuario.id}`, { rolesIds }),
      esAdmin ? `${usuario.nombre} ya no es admin.` : `${usuario.nombre} ahora es admin.`
    )
  }

  const cambiarActivo = (usuario) => {
    if (
      usuario.isActivo &&
      !window.confirm(
        `¿Dar de baja a ${usuario.nombre} ${usuario.apellido}? No va a poder ingresar y sus negocios dejan de aparecer en el catálogo.`
      )
    )
      return
    ejecutar(
      usuario,
      () => clienteAxios.put(`/usuarios/${usuario.id}/estado`, { isActivo: !usuario.isActivo }),
      usuario.isActivo ? `${usuario.nombre} fue dado de baja.` : `${usuario.nombre} fue reactivado.`
    )
  }

  if (cargando) return <Cargando texto="Cargando usuarios..." />

  if (error) {
    return <p className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200" role="alert">{error}</p>
  }

  const texto = busqueda.trim().toLowerCase()
  const filtrados = usuarios.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(texto)
  )
  const cantidadAdmins = usuarios.filter((u) => u.roles.includes("Admin")).length
  const cantidadBajas = usuarios.filter((u) => !u.isActivo).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-pizarra">
          {usuarios.length} usuarios · {cantidadAdmins} admin · {cantidadBajas} dados de baja
        </p>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o email"
          aria-label="Buscar usuarios"
          className="w-full sm:w-72 rounded-lg border border-borde bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya"
        />
      </div>

      {errorAccion && <p className="mb-4 text-sm text-red-700" role="alert">{errorAccion}</p>}

      {filtrados.length === 0 ? (
        <p className="text-pizarra">No hay usuarios que coincidan con la búsqueda.</p>
      ) : (
        <ul className="space-y-3">
          {filtrados.map((usuario) => {
            const esYo = usuario.id === yo?.id
            const esAdmin = usuario.roles.includes("Admin")
            return (
              <li
                key={usuario.id}
                className={`flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-borde ${
                  usuario.isActivo ? "" : "opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {usuario.nombre} {usuario.apellido}
                    {esYo && <span className="ml-2 text-sm font-normal text-pizarra">(vos)</span>}
                  </p>
                  <p className="text-sm text-pizarra break-all">{usuario.email}</p>
                  <p className="text-xs text-pizarra">
                    Alta: {new Date(usuario.fechaRegistro).toLocaleDateString("es-AR")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {usuario.roles.map((rol) => (
                    <span
                      key={rol}
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        rol === "Admin" ? "bg-turno text-white" : "bg-fondo text-pizarra border border-borde"
                      }`}
                    >
                      {rol}
                    </span>
                  ))}
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      usuario.isActivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {usuario.isActivo ? "Activo" : "Dado de baja"}
                  </span>

                  {/* El admin no puede quitarse su rol ni darse de baja (el back tambien lo impide) */}
                  <button
                    type="button"
                    onClick={() => cambiarAdmin(usuario)}
                    disabled={esYo || procesando === usuario.id}
                    title={esYo ? "No podés cambiar tus propios roles" : undefined}
                    className={claseBoton}
                  >
                    {esAdmin ? "Quitar admin" : "Hacer admin"}
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarActivo(usuario)}
                    disabled={esYo || procesando === usuario.id}
                    title={esYo ? "No podés darte de baja a vos mismo" : undefined}
                    className={claseBoton}
                  >
                    {usuario.isActivo ? "Dar de baja" : "Reactivar"}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

import { useEffect, useState } from "react"
import { ContextoAuth } from "./contexto-auth"
import clienteAxios from "../api/clienteAxios"

// Proveedor de la sesion: guarda el usuario logueado y expone login, registro y logout.
// El token se guarda en localStorage para que la sesion sobreviva al recargar la pagina.
export const ProveedorAuth = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  // Si hay token guardado, arrancamos "cargando" hasta confirmar con el back quien es
  const [cargando, setCargando] = useState(() => localStorage.getItem("token") !== null)

  // Al montar: si hay token, se pide el usuario actual (GET /api/auth/me)
  useEffect(() => {
    if (localStorage.getItem("token") === null) return

    clienteAxios
      .get("/auth/me")
      .then((respuesta) => setUsuario(respuesta.data.datos))
      .catch(() => {
        localStorage.removeItem("token")
        setUsuario(null)
      })
      .finally(() => setCargando(false))
  }, [])

  // Si el interceptor de Axios detecta un 401, cierra la sesion
  useEffect(() => {
    const alExpirar = () => setUsuario(null)
    window.addEventListener("sesion-expirada", alExpirar)
    return () => window.removeEventListener("sesion-expirada", alExpirar)
  }, [])

  // POST /api/auth/login -> { token, usuario }
  const login = async (email, clave) => {
    const respuesta = await clienteAxios.post("/auth/login", { email, clave })
    const { token, usuario } = respuesta.data.datos
    localStorage.setItem("token", token)
    setUsuario(usuario)
    return usuario
  }

  // POST /api/auth/register y despues login automatico
  const registrar = async (datos) => {
    await clienteAxios.post("/auth/register", datos)
    return login(datos.email, datos.clave)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUsuario(null)
  }

  const esAdmin = usuario?.roles?.includes("Admin") ?? false

  return (
    <ContextoAuth.Provider value={{ usuario, cargando, esAdmin, login, registrar, logout }}>
      {children}
    </ContextoAuth.Provider>
  )
}

import { useContext } from "react"
import { ContextoAuth } from "../context/contexto-auth"

// Hook personalizado para leer la sesion desde cualquier componente:
//   const { usuario, login, logout } = useAuth()
export function useAuth() {
  const contexto = useContext(ContextoAuth)
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de <ProveedorAuth>")
  }
  return contexto
}

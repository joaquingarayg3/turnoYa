import { createContext } from "react"

// Contexto de los avisos emergentes ("toasts"): mensajes cortos de exito o error
// que aparecen unos segundos despues de una accion (reservar, guardar, aprobar...).
export const ContextoAvisos = createContext(null)

// Ayudantes de la agenda del comerciante.
// Los usan la agenda de un negocio (components/comerciante/agenda-negocio.jsx)
// y la agenda de todos los negocios juntos (pages/comerciante/agenda.jsx).

// Mismo orden que el enum EstadoTurno del backend (por si llega como número)
const ESTADOS = ["Pendiente", "Confirmado", "Cancelado", "Completado"]

export const COLORES_ESTADO = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmado: "bg-green-100 text-green-700",
  Cancelado: "bg-red-100 text-red-700",
  Completado: "bg-blue-100 text-blue-700",
}

// Fecha local en formato año-mes-día (lo que espera el backend)
export function formatearFecha(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, "0")
  const dia = String(fecha.getDate()).padStart(2, "0")
  return `${anio}-${mes}-${dia}`
}

export function sumarDias(fechaTexto, dias) {
  const [anio, mes, dia] = fechaTexto.split("-").map(Number)
  return formatearFecha(new Date(anio, mes - 1, dia + dias))
}

export function nombreEstado(estado) {
  return typeof estado === "number" ? ESTADOS[estado] : estado
}

// Hora en formato de 24 h (15:00), que es el habitual en Argentina
export function hora(fechaHora) {
  return new Date(fechaHora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
}

// "2026-11-17" -> "martes 17 de noviembre" (se arma con año, mes y dia para no correr la fecha por la zona horaria)
export function nombreDia(fechaTexto) {
  const [anio, mes, dia] = fechaTexto.split("-").map(Number)
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
}

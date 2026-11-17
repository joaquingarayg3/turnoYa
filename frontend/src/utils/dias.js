// Dias como los manda el back (enum DayOfWeek de .NET), en el orden de la semana argentina.
// Los usan los horarios de atencion del negocio (B) y el detalle del negocio (D6).
export const DIAS_SEMANA = [
  { valor: "Monday", nombre: "Lunes" },
  { valor: "Tuesday", nombre: "Martes" },
  { valor: "Wednesday", nombre: "Miércoles" },
  { valor: "Thursday", nombre: "Jueves" },
  { valor: "Friday", nombre: "Viernes" },
  { valor: "Saturday", nombre: "Sábado" },
  { valor: "Sunday", nombre: "Domingo" },
]

// "09:00:00" (TimeOnly del back) -> "09:00"
export function horaCorta(hora) {
  return hora.slice(0, 5)
}

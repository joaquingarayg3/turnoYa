// Ayudantes de fechas (C1). Los usan C2 (reservar) y C3 (mis turnos).
// El back trabaja en hora local, sin zona horaria: manda y espera "2026-11-12T10:00:00" (sin Z).
// Por eso NO se usa toISOString(): ese metodo convierte a UTC y corre la hora varias horas.

const dosDigitos = (n) => String(n).padStart(2, "0");

// Date -> "2026-11-12T10:00", el formato que usa <input type="datetime-local"> en sus atributos min y max
export function aValorInput(fecha) {
  const dia = `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
  const hora = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
  return `${dia}T${hora}`;
}

// Valor del <input type="datetime-local"> -> "2026-11-12T10:00:00", listo para mandar al back
export function aFechaHoraLocal(valorInput) {
  // El input da "2026-11-12T10:00" (sin segundos): se los agregamos
  return valorInput.length === 16 ? `${valorInput}:00` : valorInput;
}

// "2026-11-12T10:00:00" -> "jueves, 12 de noviembre, 10:00"
export function formatearFechaHora(iso) {
  // Sin Z ni offset, JavaScript lo interpreta como hora local: no hay corrimiento
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23", // 24 h (15:00), como en la agenda del comerciante
  });
}

// "2026-11-12T10:00:00" -> "10:00"
export function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

// ¿El turno todavia no empezo? Sirve para separar proximos de pasados
export function esFuturo(iso) {
  return new Date(iso) > new Date();
}

// Dias como los manda el back (enum DayOfWeek de .NET), en el orden de la semana argentina.
// Los usan los horarios de atencion (B) y el detalle del negocio (D6).
export const DIAS_SEMANA = [
  { valor: "Monday", nombre: "Lunes" },
  { valor: "Tuesday", nombre: "Martes" },
  { valor: "Wednesday", nombre: "Miércoles" },
  { valor: "Thursday", nombre: "Jueves" },
  { valor: "Friday", nombre: "Viernes" },
  { valor: "Saturday", nombre: "Sábado" },
  { valor: "Sunday", nombre: "Domingo" },
];

// "09:00:00" (TimeOnly del back) -> "09:00"
export function horaCorta(hora) {
  return hora.slice(0, 5);
}

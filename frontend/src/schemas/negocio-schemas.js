import { z } from "zod"

// Mismas reglas que CrearNegocioDTO / ActualizarNegocioDTO del backend.
// Los numeros se registran con valueAsNumber: un campo vacio llega como NaN y Zod lo rechaza.
const entero = (requerido, min, max, unidad) =>
  z
    .number({ error: requerido })
    .int("Ingresá un número entero.")
    .min(min, `Mínimo ${min} ${unidad}.`)
    .max(max, `Máximo ${max} ${unidad}.`)

export const esquemaNegocio = z.object({
  nombre: z.string().trim().min(2, "Ingresá al menos 2 caracteres.").max(100, "Máximo 100 caracteres."),
  rubro: z.string().trim().min(2, "Ingresá al menos 2 caracteres.").max(60, "Máximo 60 caracteres."),
  descripcion: z.string().trim().max(500, "Máximo 500 caracteres."),
  direccion: z.string().trim().max(150, "Máximo 150 caracteres."),
  telefono: z.string().trim().max(30, "Máximo 30 caracteres."),
  intervaloTurnosMinutos: entero("Ingresá el intervalo.", 5, 240, "minutos"),
  diasMaxAnticipacion: entero("Ingresá la anticipación máxima.", 1, 365, "días"),
  horasToleranciaCancelacion: entero("Ingresá la tolerancia de cancelación.", 0, 168, "horas"),
})

import { z } from "zod"

// Mismas reglas que CrearServicioDTO / ActualizarServicioDTO del backend (modulo 07).
// duracionMinutos y precio se registran con valueAsNumber: un campo vacio llega como NaN
// y Zod lo rechaza con el mensaje de "requerido".
export const esquemaServicio = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre puede tener hasta 100 caracteres."),
  descripcion: z.string().trim().max(500, "La descripción puede tener hasta 500 caracteres."),
  duracionMinutos: z
    .number({ error: "La duración es requerida." })
    .int("La duración debe ser un número entero.")
    .min(5, "La duración debe estar entre 5 y 480 minutos.")
    .max(480, "La duración debe estar entre 5 y 480 minutos."),
  precio: z
    .number({ error: "El precio es requerido." })
    .min(0, "El precio debe ser un número mayor o igual a 0."),
})

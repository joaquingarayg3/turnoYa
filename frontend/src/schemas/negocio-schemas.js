import { z } from "zod"
import { NOMBRES_RUBROS } from "../utils/rubros"

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
  // Lista cerrada: el back rechaza cualquier otro valor
  rubro: z.enum(NOMBRES_RUBROS, { error: "Elegí un rubro de la lista." }),
  descripcion: z.string().trim().max(500, "Máximo 500 caracteres."),
  direccion: z.string().trim().max(150, "Máximo 150 caracteres."),
  telefono: z.string().trim().max(30, "Máximo 30 caracteres."),
  // Opcional: vacio = portada del rubro. Si se completa, tiene que ser un link http o https
  bannerUrl: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .refine((valor) => valor === "" || /^https?:\/\/\S+$/i.test(valor), {
      message: "Pegá un link que empiece con http:// o https://",
    }),
  intervaloTurnosMinutos: entero("Ingresá el intervalo.", 5, 240, "minutos"),
  diasMaxAnticipacion: entero("Ingresá la anticipación máxima.", 1, 365, "días"),
  horasToleranciaCancelacion: entero("Ingresá la tolerancia de cancelación.", 0, 168, "horas"),
})

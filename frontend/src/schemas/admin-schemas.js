import { z } from "zod"

// Rechazo de un negocio (panel Admin): el motivo lo ve el dueño en "Mis negocios"
export const esquemaRechazo = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, "Contale al dueño por qué se rechaza (al menos 5 caracteres).")
    .max(300, "El motivo puede tener hasta 300 caracteres."),
})

import { z } from "zod";

// Esquema de validacion con Zod. Repite las reglas de CrearTurnoDTO del back

export const esquemaReserva = z.object({
  servicioId: z.string().min(1, "Elegí un servicio"),
  dia: z.string().min(1, "Elegí un día"),
  hora: z.string().min(1, "Elegí un horario"),
  notas: z.string().max(300, "Máximo 300 caracteres").optional(),
});

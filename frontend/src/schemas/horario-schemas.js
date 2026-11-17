import { z } from "zod"

// Horarios de atencion: una lista de franjas { diaSemana, horaDesde, horaHasta }.
// Mismas reglas que HorariosService del backend. Las horas vienen del <input type="time"> ("09:00"),
// y como tienen siempre 5 caracteres se pueden comparar como texto ("09:00" < "13:00").
const HORA = /^\d{2}:\d{2}$/

const esquemaFranja = z
  .object({
    diaSemana: z.string(),
    horaDesde: z.string().regex(HORA, "Completá la hora de apertura."),
    horaHasta: z.string().regex(HORA, "Completá la hora de cierre."),
  })
  .refine((franja) => franja.horaDesde < franja.horaHasta, {
    message: "El cierre tiene que ser después de la apertura.",
    path: ["horaHasta"],
  })

export const esquemaHorarios = z
  .object({ franjas: z.array(esquemaFranja) })
  // Dos franjas del mismo dia no pueden pisarse (9-13 y 12-16 se superponen; 9-13 y 13-17 no)
  .superRefine((datos, ctx) => {
    datos.franjas.forEach((a, i) => {
      datos.franjas.forEach((b, j) => {
        if (j <= i || a.diaSemana !== b.diaSemana) return
        if (a.horaDesde < b.horaHasta && b.horaDesde < a.horaHasta) {
          ctx.addIssue({
            code: "custom",
            message: "Se superpone con otra franja del mismo día.",
            path: ["franjas", j, "horaDesde"],
          })
        }
      })
    })
  })

import { z } from "zod"

// Buscador del catalogo (D5). Los dos campos son opcionales: vacios = mostrar todo.
export const esquemaBusqueda = z.object({
  busqueda: z.string().trim().max(100, "La búsqueda puede tener hasta 100 caracteres."),
  rubro: z.string(),
})

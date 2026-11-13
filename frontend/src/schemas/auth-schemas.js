import { z } from "zod"

// Esquemas de validacion con Zod (modulo 07). Repiten las reglas de los DTO del back
// (LoginDTO y CrearUsuarioDTO) para avisar antes de mandar la peticion.

export const esquemaLogin = z.object({
  email: z.string().trim().min(1, "El email es requerido").email("Email inválido"),
  clave: z.string().min(1, "La clave es requerida"),
})

export const esquemaRegistro = z
  .object({
    nombre: z.string().trim().min(2, "Mínimo 2 caracteres").max(60, "Máximo 60 caracteres"),
    apellido: z.string().trim().min(2, "Mínimo 2 caracteres").max(60, "Máximo 60 caracteres"),
    email: z.string().trim().min(1, "El email es requerido").email("Email inválido").max(120, "Máximo 120 caracteres"),
    telefono: z.string().trim().max(30, "Máximo 30 caracteres").optional(),
    clave: z.string().min(6, "La clave debe tener al menos 6 caracteres"),
    confirmarClave: z.string().min(1, "Repetí la clave"),
  })
  .refine((datos) => datos.clave === datos.confirmarClave, {
    message: "Las claves no coinciden",
    path: ["confirmarClave"],
  })

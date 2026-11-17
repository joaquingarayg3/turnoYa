// Rubros permitidos (lista cerrada): la misma que Enums/RUBROS.cs del backend.
// Cada rubro tiene su icono y su combinacion de colores para la portada del negocio.
export const RUBROS = [
  { valor: "Barbería y peluquería", icono: "tijeras", esquema: "oscuro" },
  { valor: "Estética y belleza", icono: "brillo", esquema: "naranja" },
  { valor: "Salud", icono: "cruz", esquema: "pizarra" },
  { valor: "Taller mecánico", icono: "tuerca", esquema: "oscuro" },
  { valor: "Gimnasio y deportes", icono: "pesa", esquema: "naranja" },
  { valor: "Veterinaria", icono: "huella", esquema: "pizarra" },
  { valor: "Otros", icono: "reloj", esquema: "oscuro" },
]

// Solo los nombres, para el esquema de Zod y el desplegable
export const NOMBRES_RUBROS = RUBROS.map((rubro) => rubro.valor)

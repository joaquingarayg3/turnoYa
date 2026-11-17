import { useState } from "react"
import { RUBROS } from "../utils/rubros"

// Portada (banner) de un negocio, generada a partir de su rubro: no hace falta subir imagenes.
// Cada rubro de la lista cerrada (utils/rubros.js) tiene su icono y su combinacion de colores.
// Se usa en el catalogo (D5), el detalle del negocio (D6) y la reserva (C2).

// Combinaciones de colores del manual de marca
const ESQUEMAS = {
  oscuro: { fondo: "#14213D", puntos: "rgba(255,255,255,0.10)", icono: "#E2700B", chip: "rgba(255,255,255,0.10)", grande: "#FFFFFF" },
  naranja: { fondo: "#E2700B", puntos: "rgba(20,33,61,0.14)", icono: "#14213D", chip: "rgba(255,255,255,0.30)", grande: "#14213D" },
  pizarra: { fondo: "#4A5468", puntos: "rgba(255,255,255,0.10)", icono: "#FFFFFF", chip: "rgba(255,255,255,0.12)", grande: "#FFFFFF" },
}

// Respaldo para negocios cargados antes de cerrar la lista de rubros:
// palabras clave (sin tildes) -> icono y esquema. La primera que coincide gana.
const CATEGORIAS = [
  { claves: ["barber", "peluq", "corte", "estilis"], icono: "tijeras", esquema: "oscuro" },
  { claves: ["estetic", "belleza", "spa", "una", "manicur", "depil", "masaj", "cosmet"], icono: "brillo", esquema: "naranja" },
  { claves: ["salud", "consult", "medic", "odonto", "dent", "kine", "psico", "nutri", "clinic"], icono: "cruz", esquema: "pizarra" },
  { claves: ["taller", "mecanic", "auto", "lavadero", "gomeria", "service"], icono: "tuerca", esquema: "oscuro" },
  { claves: ["gym", "gimnas", "fitness", "entren", "yoga", "pilates", "deport", "crossfit"], icono: "pesa", esquema: "naranja" },
  { claves: ["veterin", "mascota", "pet", "canino"], icono: "huella", esquema: "pizarra" },
]

const POR_DEFECTO = { icono: "reloj", esquema: "oscuro" }

function normalizar(texto) {
  return (texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

function categoriaDeRubro(rubro) {
  const exacto = RUBROS.find((r) => r.valor === rubro)
  if (exacto) return exacto
  const texto = normalizar(rubro)
  return CATEGORIAS.find((categoria) => categoria.claves.some((clave) => texto.includes(clave))) ?? POR_DEFECTO
}

// Iconos dibujados con trazos simples (viewBox 24x24)
function Icono({ nombre, color, className }) {
  const trazo = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {nombre === "tijeras" && (
        <g {...trazo}>
          <circle cx="7" cy="17" r="3" />
          <circle cx="17" cy="17" r="3" />
          <path d="M9 15 16 4M15 15 8 4" />
        </g>
      )}
      {nombre === "brillo" && (
        <g {...trazo}>
          <path d="M12 3 13.8 10.2 21 12 13.8 13.8 12 21 10.2 13.8 3 12 10.2 10.2Z" />
          <path d="M19 3v3M17.5 4.5h3" />
        </g>
      )}
      {nombre === "cruz" && (
        <g {...trazo}>
          <path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5Z" />
        </g>
      )}
      {nombre === "tuerca" && (
        <g {...trazo}>
          <path d="M12 3 19.8 7.5v9L12 21l-7.8-4.5v-9Z" />
          <circle cx="12" cy="12" r="3.2" />
        </g>
      )}
      {nombre === "pesa" && (
        <g {...trazo}>
          <path d="M6.5 12h11M3 9.5v5M6.5 7v10M17.5 7v10M21 9.5v5" />
        </g>
      )}
      {nombre === "huella" && (
        <g {...trazo}>
          <ellipse cx="12" cy="16" rx="4" ry="3.5" />
          <circle cx="6" cy="10" r="1.8" />
          <circle cx="10" cy="6.5" r="1.8" />
          <circle cx="14" cy="6.5" r="1.8" />
          <circle cx="18" cy="10" r="1.8" />
        </g>
      )}
      {nombre === "reloj" && (
        <g {...trazo}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5 11 15.5 16.5 9" />
        </g>
      )}
    </svg>
  )
}

// rubro: elige el icono (siempre) y la portada por defecto.
// imagen: link a una imagen de portada que cargo el dueño (opcional). Si no hay, o si el link
//   no carga, se muestra la portada generada segun el rubro.
// alto: clases de Tailwind para la altura (ej: "h-28").
// redondeo: clases para redondear las esquinas segun donde se use (ej: "rounded-t-2xl").
export default function PortadaNegocio({ rubro, imagen, alto = "h-28", redondeo = "" }) {
  const categoria = categoriaDeRubro(rubro)
  const colores = ESQUEMAS[categoria.esquema]
  // Guarda que link fallo: si el dueño lo cambia por otro, se vuelve a intentar
  const [linkFallido, setLinkFallido] = useState(null)
  const conImagen = Boolean(imagen) && linkFallido !== imagen

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${alto} ${redondeo}`}
      style={
        conImagen
          ? { backgroundColor: colores.fondo }
          : {
              backgroundColor: colores.fondo,
              backgroundImage: `radial-gradient(${colores.puntos} 1.5px, transparent 1.5px)`,
              backgroundSize: "18px 18px",
            }
      }
    >
      {conImagen ? (
        <>
          <img
            src={imagen}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setLinkFallido(imagen)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Sombra a la izquierda para que el icono se lea sobre cualquier foto */}
          <div className="absolute inset-0 bg-linear-to-r from-black/45 via-black/10 to-transparent" />
        </>
      ) : (
        // Portada por defecto: icono grande y tenue de fondo, cortado por el borde
        <Icono
          nombre={categoria.icono}
          color={colores.grande}
          className="absolute -right-6 -bottom-10 h-44 w-44 -rotate-12 opacity-15"
        />
      )}

      {/* El icono del rubro se ve siempre, haya imagen o no */}
      <div
        className="absolute left-5 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: conImagen ? colores.fondo : colores.chip }}
      >
        <Icono nombre={categoria.icono} color={colores.icono} className="h-8 w-8" />
      </div>
    </div>
  )
}

// Solo el icono del rubro (lo usan los botones de rubro del catalogo)
export function IconoRubro({ rubro, color = "currentColor", className = "h-5 w-5" }) {
  return <Icono nombre={categoriaDeRubro(rubro).icono} color={color} className={className} />
}

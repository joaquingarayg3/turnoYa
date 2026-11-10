# Marca en el frontend

Resumen del manual de marca de TurnoYa aplicado a React + Tailwind. Los colores y tipografías están definidos en `frontend/src/index.css` (`@theme`): **usar estas clases, nunca colores sueltos** (`indigo`, `blue`, hex a mano).

## Colores

| Nombre | Hex | Clases | Uso |
|---|---|---|---|
| Azul Turno | `#14213D` | `text-turno`, `bg-turno` | Textos, títulos, fondos oscuros (footer) |
| Naranja Ya | `#E2700B` | `bg-ya`, `text-ya`, `border-ya` | Botón principal, acentos, el "Ya" del logo, títulos grandes |
| Naranja texto | `#B35A00` | `text-ya-texto` | Links y textos chicos en naranja |
| Gris pizarra | `#4A5468` | `text-pizarra` | Texto secundario, ayudas, etiquetas |
| Fondo claro | `#F4F6FA` | `bg-fondo` | Fondo de pantalla (ya está en `body`) |
| Borde | `#DDE2EC` | `border-borde` | Bordes de tarjetas, inputs y separadores |
| Blanco | `#FFFFFF` | `bg-white` | Tarjetas y barra superior |

Proporción: mucho claro, azul para el texto, **naranja solo como acento**. Si todo es naranja, nada destaca.

**Contraste:** el Naranja Ya sobre blanco no alcanza para texto chico. Para links o texto naranja de tamaño normal, usar `text-ya-texto`.

## Tipografía

| Uso | Fuente | Clases |
|---|---|---|
| Títulos (`h1`, `h2`, `h3`) | Space Grotesk | Automático en `h1`–`h3`; en otro elemento: `font-display` |
| Textos, formularios, botones | Inter | Automático (es la fuente por defecto) |

Tamaños sugeridos: título de página `text-3xl font-bold`, subtítulo `text-xl font-medium`, cuerpo `text-base`, ayudas `text-sm text-pizarra`.

## Componentes recurrentes

```jsx
// Botón principal (uno por pantalla)
<button className="px-4 py-2 rounded-lg font-semibold bg-ya text-turno hover:brightness-95">Confirmar turno</button>

// Botón secundario
<button className="px-4 py-2 rounded-lg font-semibold border border-borde bg-white text-turno hover:bg-fondo">Cancelar</button>

// Link
<Link href="/..." className="font-medium text-ya-texto hover:underline">Ver detalle</Link>

// Tarjeta
<div className="rounded-2xl border border-borde bg-white p-6">...</div>

// Input con label
<label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
<input id="email" className="w-full rounded-lg border border-borde px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya" />

// Mensaje de error
<p className="text-sm text-red-700">El email es requerido</p>
```

## Logo

```jsx
import Logo, { Isotipo } from '../components/Logo.jsx'

<Logo size={32} />            // isotipo + "TurnoYa" (barra superior)
<Logo size={24} negativo />   // sobre fondo azul (footer)
<Isotipo size={80} />         // solo el reloj-check
```

No deformar, rotar, cambiar colores, agregar sombras ni cambiar la tipografía del logo. Por debajo de 32 px el componente quita solo la marca de las 12, como pide el manual.

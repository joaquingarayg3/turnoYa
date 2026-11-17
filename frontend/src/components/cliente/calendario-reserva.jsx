import { useState } from "react"

// Calendario de un mes para elegir el dia del turno (C2). Hecho a mano, sin librerias.
// Las fechas se manejan como texto "2026-11-17" (lo que espera el back): asi se pueden comparar
// directamente (min <= fecha <= max) y no hay corrimientos por la zona horaria.

const NOMBRES_DIAS = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"]

const dosDigitos = (n) => String(n).padStart(2, "0")
const aTexto = (anio, mes, dia) => `${anio}-${dosDigitos(mes + 1)}-${dosDigitos(dia)}` // mes de 0 a 11

// Arma las semanas del mes, empezando el lunes. Los huecos antes del dia 1 y despues del ultimo son null.
function semanasDelMes(anio, mes) {
  const primerDia = new Date(anio, mes, 1).getDay() // 0 = domingo ... 6 = sabado
  const huecosAntes = (primerDia + 6) % 7 // cuantos dias hay entre el lunes y el dia 1
  const diasDelMes = new Date(anio, mes + 1, 0).getDate()

  const celdas = [...Array(huecosAntes).fill(null), ...Array.from({ length: diasDelMes }, (_, i) => i + 1)]
  while (celdas.length % 7 !== 0) celdas.push(null)

  const semanas = []
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7))
  return semanas
}

// valor: dia elegido ("2026-11-18" o "")
// onElegir(fecha): se llama al tocar un dia habilitado
// minimo y maximo: primer y ultimo dia que se puede reservar ("2026-11-17", "2026-12-17")
// diasAbiertos: Set con los dias de la semana en que el negocio atiende (0 = domingo ... 6 = sabado)
export default function CalendarioReserva({ valor, onElegir, minimo, maximo, diasAbiertos }) {
  // Mes que se esta mirando: arranca en el del dia elegido o, si no hay, en el del minimo (hoy)
  const inicial = (valor || minimo).split("-").map(Number)
  const [vista, setVista] = useState({ anio: inicial[0], mes: inicial[1] - 1 })

  const nombreMes = new Date(vista.anio, vista.mes, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
  // Solo se puede ir a los meses donde hay algun dia reservable
  const puedeRetroceder = aTexto(vista.anio, vista.mes, 1) > minimo
  const puedeAvanzar = aTexto(vista.anio, vista.mes + 1, 1) <= maximo

  const cambiarMes = (salto) => {
    const fecha = new Date(vista.anio, vista.mes + salto, 1)
    setVista({ anio: fecha.getFullYear(), mes: fecha.getMonth() })
  }

  const claseFlecha =
    "flex h-9 w-9 items-center justify-center rounded-full border border-borde bg-white transition hover:bg-fondo disabled:opacity-30 disabled:hover:bg-white"

  return (
    <div className="rounded-2xl border border-borde bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => cambiarMes(-1)} disabled={!puedeRetroceder} className={claseFlecha} aria-label="Mes anterior">
          ‹
        </button>
        <p className="font-semibold first-letter:uppercase" aria-live="polite">{nombreMes}</p>
        <button type="button" onClick={() => cambiarMes(1)} disabled={!puedeAvanzar} className={claseFlecha} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-semibold text-pizarra">
        {NOMBRES_DIAS.map((nombre) => (
          <span key={nombre} className="py-1">{nombre}</span>
        ))}
      </div>

      {semanasDelMes(vista.anio, vista.mes).map((semana, i) => (
        <div key={i} className="grid grid-cols-7 text-center">
          {semana.map((dia, j) => {
            if (dia === null) return <span key={j} />

            const fecha = aTexto(vista.anio, vista.mes, dia)
            const diaSemana = new Date(vista.anio, vista.mes, dia).getDay()
            const habilitado = fecha >= minimo && fecha <= maximo && diasAbiertos.has(diaSemana)
            const elegido = fecha === valor
            const esHoy = fecha === minimo

            return (
              // key con la fecha: al cambiar de mes cada dia es un boton nuevo (no hereda la animacion del anterior)
              <div key={fecha} className="flex justify-center py-0.5">
                <button
                  type="button"
                  disabled={!habilitado}
                  onClick={() => onElegir(fecha)}
                  aria-pressed={elegido}
                  aria-label={new Date(vista.anio, vista.mes, dia).toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition ${
                    elegido
                      ? "bg-turno font-bold text-white"
                      : habilitado
                        ? `font-semibold text-turno hover:bg-fondo ${esHoy ? "ring-1 ring-ya" : ""}`
                        : "text-pizarra/35"
                  }`}
                >
                  {dia}
                </button>
              </div>
            )
          })}
        </div>
      ))}

      <p className="mt-2 text-xs text-pizarra">Los días en gris no tienen atención o están fuera del plazo para reservar.</p>
    </div>
  )
}

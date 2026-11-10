// Logo TurnoYa segun el manual de marca:
// isotipo = reloj cuyas agujas forman un tilde (el turno ya esta confirmado) + logotipo con "Ya" en naranja.
// negativo = version para fondos oscuros (circulo y "Turno" en blanco).

export function Isotipo({ size = 32, negativo = false }) {
  const trazo = negativo ? '#FFFFFF' : '#14213D'
  // Por debajo de 32 px el manual pide quitar la marca de las 12
  const conMarca = size >= 32

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke={trazo} strokeWidth={conMarca ? 8 : 10} />
      {conMarca && (
        <line x1="50" y1="16" x2="50" y2="22" stroke={trazo} strokeWidth="6" strokeLinecap="round" />
      )}
      <polyline
        points="31,52 45,66 71,36"
        fill="none"
        stroke="#E2700B"
        strokeWidth={conMarca ? 9 : 12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({ size = 32, negativo = false }) {
  return (
    <span className="inline-flex items-center" style={{ gap: size * 0.22 }}>
      <Isotipo size={size} negativo={negativo} />
      <span
        className={`font-display font-bold leading-none ${negativo ? 'text-white' : 'text-turno'}`}
        style={{ fontSize: size * 0.72, letterSpacing: '-0.04em' }}
      >
        Turno<span className="text-ya">Ya</span>
      </span>
    </span>
  )
}

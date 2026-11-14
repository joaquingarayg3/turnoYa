// Marcador de pagina sin hacer. Cada track lo reemplaza por su pantalla real.
export default function Pendiente({ titulo, tarea, children }) {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">{titulo}</h1>
      <div className="rounded-2xl border border-dashed border-borde bg-white p-6 text-pizarra">
        <p className="font-semibold text-turno">
          <span className="text-ya-texto">Pendiente</span> · {tarea}
        </p>
        {children && <div className="mt-2 text-sm">{children}</div>}
      </div>
    </section>
  )
}

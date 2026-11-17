import { useEffect, useState } from "react";
import { Link } from "wouter";

import clienteAxios from "../../api/clienteAxios";
import { ListaEsqueleto } from "../../components/esqueleto";
import { useAvisos } from "../../hooks/use-avisos";
import { esFuturo, formatearFechaHora, formatearHora } from "../../utils/fechas";
import { mensajeDeError } from "../../utils/errores";

// Mismos colores de estado que la agenda del comerciante (B3)
const COLORES_ESTADO = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmado: "bg-green-100 text-green-700",
  Cancelado: "bg-red-100 text-red-700",
  Completado: "bg-blue-100 text-blue-700",
};

// Un turno que paso y nadie confirmo no sigue "Pendiente": se muestra como "Sin confirmar"
const estadoVisible = (turno) =>
  turno.estado === "Pendiente" && !esFuturo(turno.fechaHoraInicio)
    ? "Sin confirmar"
    : turno.estado;

const COLOR_SIN_CONFIRMAR = "bg-gray-200 text-gray-600";

// Un turno todavia por venir y que sigue vivo (pendiente o confirmado) es "proximo"
const esProximo = (turno) =>
  esFuturo(turno.fechaHoraInicio) &&
  (turno.estado === "Pendiente" || turno.estado === "Confirmado");

// Partes de la fecha para el bloque tipo calendario: "MAR", "17", "NOV", "10:30"
function partesFecha(iso) {
  const fecha = new Date(iso);
  const corto = (opciones) => fecha.toLocaleString("es-AR", opciones).replace(".", "").toUpperCase();
  return {
    diaSemana: corto({ weekday: "short" }),
    dia: fecha.getDate(),
    mes: corto({ month: "short" }),
    hora: formatearHora(iso),
  };
}

function TarjetaTurno({ turno, puedeCancelar, cancelando, onCancelar }) {
  const fecha = partesFecha(turno.fechaHoraInicio);
  const estado = estadoVisible(turno);
  const apagado = !puedeCancelar; // pasados y cancelados se ven mas suaves

  return (
    <li className="flex items-stretch gap-4 p-4 bg-white rounded-2xl border border-borde">
      {/* Bloque de fecha tipo calendario */}
      <div
        className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-xl py-2 ${
          apagado ? "bg-fondo text-pizarra" : "bg-turno text-white"
        }`}
        aria-label={formatearFechaHora(turno.fechaHoraInicio)}
      >
        <span className="text-[11px] font-semibold tracking-wide opacity-80">{fecha.diaSemana}</span>
        <span className="font-display text-2xl font-bold leading-none">{fecha.dia}</span>
        <span className={`text-[11px] font-semibold tracking-wide ${apagado ? "" : "text-ya"}`}>{fecha.mes}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="font-semibold">
            <span className={apagado ? "text-pizarra" : "text-ya-texto"}>{fecha.hora}</span> · {turno.servicioNombre}
          </p>
          <p className="text-sm text-pizarra">
            {turno.negocioNombre}
            {turno.negocioDireccion && ` · ${turno.negocioDireccion}`}
          </p>
          <p className="text-sm text-pizarra">
            ${turno.servicioPrecio.toLocaleString("es-AR")}
          </p>
          {turno.notas && (
            <p className="mt-1 text-sm text-pizarra italic">“{turno.notas}”</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              estado === "Sin confirmar" ? COLOR_SIN_CONFIRMAR : COLORES_ESTADO[turno.estado]
            }`}
          >
            {estado}
          </span>
          {puedeCancelar && (
            <button
              type="button"
              onClick={() => onCancelar(turno)}
              disabled={cancelando}
              className="text-sm px-3 py-1 rounded-lg border border-borde transition hover:bg-fondo disabled:opacity-50"
            >
              {cancelando ? "Cancelando..." : "Cancelar"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

// C3 · GET /api/turnos/mios  y  PUT /api/turnos/{id}/cancelar
export default function MisTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [cancelandoId, setCancelandoId] = useState(null);
  const { avisar } = useAvisos();

  useEffect(() => {
    const controlador = new AbortController(); // Para cancelar el pedido si se sale de la pagina

    async function cargarTurnos() {
      try {
        const respuesta = await clienteAxios.get("/turnos/mios", {
          signal: controlador.signal,
        });
        setTurnos(respuesta.data.datos);
      } catch (err) {
        if (!controlador.signal.aborted) setError(mensajeDeError(err));
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    cargarTurnos();
    return () => controlador.abort();
  }, []);

  async function cancelar(turno) {
    if (!window.confirm("¿Querés cancelar este turno?")) return;
    setErrorAccion("");
    setCancelandoId(turno.id);
    try {
      const respuesta = await clienteAxios.put(`/turnos/${turno.id}/cancelar`);
      // Reemplazamos el turno por la version que devuelve el back (ya con estado Cancelado)
      setTurnos((anteriores) =>
        anteriores.map((t) => (t.id === turno.id ? respuesta.data.datos : t)),
      );
      avisar("Turno cancelado.");
    } catch (err) {
      // Por ejemplo: ya paso el plazo para cancelar que definio el negocio
      setErrorAccion(mensajeDeError(err));
    } finally {
      setCancelandoId(null);
    }
  }

  if (cargando) {
    return (
      <section className="max-w-3xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Mis turnos</h1>
        <ListaEsqueleto />
      </section>
    );
  }

  if (error) {
    return (
      <p
        className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200"
        role="alert"
      >
        {error}
      </p>
    );
  }

  const proximos = turnos
    .filter(esProximo)
    .sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio));
  const pasados = turnos
    .filter((turno) => !esProximo(turno))
    .sort((a, b) => new Date(b.fechaHoraInicio) - new Date(a.fechaHoraInicio));

  return (
    <section className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Mis turnos</h1>

      {errorAccion && (
        <p
          className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200"
          role="alert"
        >
          {errorAccion}
        </p>
      )}

      {turnos.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-borde bg-white p-8 text-center">
          <p className="text-pizarra">Todavía no sacaste ningún turno.</p>
          <Link
            href="/"
            className="mt-3 inline-block font-medium text-ya-texto hover:underline"
          >
            Buscar dónde sacar uno
          </Link>
        </div>
      ) : (
        <>
          <h2 className="mt-6 mb-3 text-xl font-semibold">Próximos</h2>
          {proximos.length === 0 ? (
            <p className="text-pizarra">No tenés turnos próximos.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {proximos.map((turno) => (
                <TarjetaTurno
                  key={turno.id}
                  turno={turno}
                  puedeCancelar
                  cancelando={cancelandoId === turno.id}
                  onCancelar={cancelar}
                />
              ))}
            </ul>
          )}

          <h2 className="mt-8 mb-3 text-xl font-semibold">
            Pasados y cancelados
          </h2>
          {pasados.length === 0 ? (
            <p className="text-pizarra">
              Todavía no hay turnos en el historial.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pasados.map((turno) => (
                <TarjetaTurno key={turno.id} turno={turno} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useParams } from "wouter";
import clienteAxios from "../../api/clienteAxios";
import Cargando from "../../components/cargando";
import PortadaNegocio from "../../components/portada-negocio";
import CalendarioReserva from "../../components/cliente/calendario-reserva";
import { esquemaReserva } from "../../schemas/turno-schemas";
import { aFechaHoraLocal, aValorInput, formatearFechaHora } from "../../utils/fechas";
import { DIAS_SEMANA } from "../../utils/dias";
import { mensajeDeError } from "../../utils/errores";
import { useAvisos } from "../../hooks/use-avisos";

// Dia de la semana como lo manda el back ("Monday") -> numero de JavaScript (0 = domingo ... 6 = sabado)
const NUMERO_DIA = Object.fromEntries(DIAS_SEMANA.map((dia, i) => [dia.valor, (i + 1) % 7]));

// C2 · POST /api/turnos  (los datos del negocio salen de GET /api/catalogo/negocios/{id})
// Los horarios que se ofrecen salen de GET /api/servicios/{id}/disponibilidad?fecha=:
// el back ya descarta los que estan fuera del horario de atencion, los ocupados, los pasados
// y aquellos en los que el servicio no termina antes del cierre.
//
// En vez de campos clasicos se elige con tarjetas (servicio), un calendario (dia) y botones (horario).
// Igual es un formulario de React Hook Form + Zod: cada parte se conecta con <Controller>
// y guarda el mismo valor de texto que guardaria un input ("3", "2026-11-18", "10:00").
export default function Reservar() {
  const { id } = useParams();
  const { avisar } = useAvisos();
  const [, navegar] = useLocation();
  const [negocio, setNegocio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  // Horarios libres y para que servicio + dia son: { clave: "3|2026-11-17|0", lista: ["09:00", ...], error: "" }
  const [disponibilidad, setDisponibilidad] = useState({
    clave: "",
    lista: [],
    error: "",
  });
  // Al cambiar este numero se vuelven a pedir los horarios (por ejemplo, si otro tomo el turno antes)
  const [recarga, setRecarga] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaReserva),
    defaultValues: { servicioId: "", dia: "", hora: "", notas: "" },
  });

  // Se actualizan cada vez que cambia el servicio, el dia o el horario
  const servicioId = useWatch({ control, name: "servicioId" });
  const diaElegido = useWatch({ control, name: "dia" });
  const horaElegida = useWatch({ control, name: "hora" });

  useEffect(() => {
    const controlador = new AbortController(); // Para cancelar el pedido si se sale de la pagina

    async function cargarNegocio() {
      try {
        const respuesta = await clienteAxios.get(`/catalogo/negocios/${id}`, {
          signal: controlador.signal,
        });
        setNegocio(respuesta.data.datos);
      } catch (err) {
        if (!controlador.signal.aborted) {
          setErrorCarga(
            err.response?.status === 404
              ? "Este negocio no existe o no está disponible."
              : mensajeDeError(err),
          );
        }
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    cargarNegocio();
    return () => controlador.abort();
  }, [id]);

  // Cada vez que cambia el servicio o el dia se piden los horarios libres
  useEffect(() => {
    if (!servicioId || !diaElegido) return;

    const clave = `${servicioId}|${diaElegido}|${recarga}`;
    const controlador = new AbortController();

    async function cargarDisponibilidad() {
      try {
        const respuesta = await clienteAxios.get(
          `/servicios/${servicioId}/disponibilidad`,
          { params: { fecha: diaElegido }, signal: controlador.signal },
        );
        setDisponibilidad({ clave, lista: respuesta.data.datos, error: "" });
      } catch (err) {
        if (!controlador.signal.aborted) {
          setDisponibilidad({
            clave,
            lista: [],
            error: mensajeDeError(err, "No se pudieron cargar los horarios."),
          });
        }
      }
    }

    cargarDisponibilidad();
    return () => controlador.abort();
  }, [servicioId, diaElegido, recarga]);

  // Si cambia el servicio o el dia, el horario elegido antes ya no vale
  const limpiarHora = () => setValue("hora", "");

  const onSubmit = async (datos) => {
    try {
      await clienteAxios.post("/turnos", {
        servicioId: Number(datos.servicioId),
        fechaHoraInicio: aFechaHoraLocal(`${datos.dia}T${datos.hora}`),
        notas: datos.notas?.trim() || null,
      });
      avisar("¡Turno reservado! Queda pendiente hasta que el negocio lo confirme.");
      navegar("/mis-turnos");
    } catch (err) {
      // Horario ocupado, fuera de la anticipacion, etc. Se refrescan los horarios libres.
      setError("root", { message: mensajeDeError(err) });
      limpiarHora();
      setRecarga((n) => n + 1);
    }
  };

  if (cargando) return <Cargando texto="Cargando negocio..." />;

  if (errorCarga) {
    return (
      <section className="max-w-xl mx-auto">
        <p
          className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700"
          role="alert"
        >
          {errorCarga}
        </p>
        <Link
          href="/"
          className="mt-4 inline-block font-medium text-ya-texto hover:underline"
        >
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const servicios = negocio.servicios.filter((servicio) => servicio.isActivo);
  const dias = negocio.diasMaxAnticipacion;

  // Primer y ultimo dia reservable, en formato "2026-11-26" (los primeros 10 caracteres de aValorInput)
  const ahora = new Date();
  const hoy = aValorInput(ahora).slice(0, 10);
  const ultimoDia = aValorInput(
    new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + dias),
  ).slice(0, 10);
  // Dias de la semana en que el negocio atiende: los demas aparecen en gris en el calendario
  const diasAbiertos = new Set(negocio.horarios.map((horario) => NUMERO_DIA[horario.diaSemana]));

  // Estado de los horarios, segun lo que ya llego del back
  const claveActual =
    servicioId && diaElegido ? `${servicioId}|${diaElegido}|${recarga}` : "";
  const buscandoHorarios =
    claveActual !== "" && disponibilidad.clave !== claveActual;
  const horarios =
    claveActual !== "" && !buscandoHorarios ? disponibilidad.lista : [];
  const errorHorarios =
    claveActual !== "" && !buscandoHorarios ? disponibilidad.error : "";

  const servicioElegido = servicios.find((servicio) => String(servicio.id) === servicioId);
  const precio = (valor) => `$${Number(valor).toLocaleString("es-AR")}`;
  const titulo = "mb-3 text-lg font-bold";
  const mensajeError = (error) => error && <p className="mt-2 text-sm text-red-700">{error.message}</p>;

  return (
    <section className="max-w-xl mx-auto">
      <div className="overflow-hidden rounded-2xl border border-borde bg-white">
        <PortadaNegocio rubro={negocio.rubro} imagen={negocio.bannerUrl} alto="h-24" />
        <div className="p-5 sm:p-8">
          <h1 className="text-3xl font-bold">Reservar turno</h1>
          <p className="mt-1 text-pizarra">{negocio.nombre}</p>

          {servicios.length === 0 ? (
            <p className="mt-6 text-pizarra">
              Este negocio todavía no tiene servicios disponibles.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 flex flex-col gap-8"
              noValidate
            >
              {/* 1 · Servicio: una tarjeta por servicio */}
              <fieldset>
                <legend className={titulo}>1. Elegí el servicio</legend>
                <Controller
                  name="servicioId"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      {servicios.map((servicio) => {
                        const elegido = field.value === String(servicio.id);
                        return (
                          <button
                            key={servicio.id}
                            type="button"
                            aria-pressed={elegido}
                            onClick={() => {
                              field.onChange(String(servicio.id));
                              limpiarHora();
                            }}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${
                              elegido
                                ? "border-ya bg-ya/10 ring-1 ring-ya"
                                : "border-borde bg-white hover:border-pizarra"
                            }`}
                          >
                            <span>
                              <span className="block font-semibold">{servicio.nombre}</span>
                              <span className="text-sm text-pizarra">{servicio.duracionMinutos} min</span>
                            </span>
                            <span className="font-semibold whitespace-nowrap">{precio(servicio.precio)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {mensajeError(errors.servicioId)}
              </fieldset>

              {/* 2 · Dia: calendario del mes */}
              <fieldset>
                <legend className={titulo}>2. Elegí el día</legend>
                {diasAbiertos.size === 0 ? (
                  <p className="text-pizarra">El negocio todavía no cargó sus horarios de atención.</p>
                ) : (
                  <Controller
                    name="dia"
                    control={control}
                    render={({ field }) => (
                      <CalendarioReserva
                        valor={field.value}
                        onElegir={(fecha) => {
                          field.onChange(fecha);
                          limpiarHora();
                        }}
                        minimo={hoy}
                        maximo={ultimoDia}
                        diasAbiertos={diasAbiertos}
                      />
                    )}
                  />
                )}
                {mensajeError(errors.dia)}
              </fieldset>

              {/* 3 · Horario: botones con los horarios libres */}
              <fieldset>
                <legend className={titulo}>3. Elegí el horario</legend>
                {!claveActual ? (
                  <p className="text-pizarra">Primero elegí el servicio y el día.</p>
                ) : buscandoHorarios ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy="true">
                    {Array.from({ length: 8 }, (_, i) => (
                      <span key={i} className="h-11 animate-pulse rounded-lg bg-fondo" />
                    ))}
                  </div>
                ) : errorHorarios ? (
                  <p className="text-sm text-red-700">{errorHorarios}</p>
                ) : horarios.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-borde p-4 text-center text-pizarra">
                    No hay horarios libres ese día. Probá con otro día.
                  </p>
                ) : (
                  <Controller
                    name="hora"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {horarios.map((hora) => {
                          const elegido = field.value === hora;
                          return (
                            <button
                              key={hora}
                              type="button"
                              aria-pressed={elegido}
                              onClick={() => field.onChange(hora)}
                              className={`h-11 rounded-lg border text-sm font-semibold transition ${
                                elegido
                                  ? "border-turno bg-turno text-white"
                                  : "border-borde bg-white text-turno hover:border-turno"
                              }`}
                            >
                              {hora}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                )}
                {claveActual && !buscandoHorarios && horarios.length > 0 && (
                  <p className="mt-2 text-sm text-pizarra">
                    Solo aparecen los horarios en los que el servicio entra completo dentro del horario de atención.
                  </p>
                )}
                {mensajeError(errors.hora)}
              </fieldset>

              {/* Notas (campo clasico: es texto libre) */}
              <div>
                <label htmlFor="notas" className="block text-sm font-medium mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  id="notas"
                  rows={2}
                  aria-invalid={errors.notas ? "true" : "false"}
                  className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya ${
                    errors.notas ? "border-red-600" : "border-borde"
                  }`}
                  {...register("notas")}
                />
                {mensajeError(errors.notas)}
              </div>

              {/* Resumen antes de confirmar */}
              {servicioElegido && diaElegido && horaElegida && (
                <div className="rounded-xl bg-fondo p-4">
                  <p className="text-sm text-pizarra">Tu turno</p>
                  <p className="font-semibold first-letter:uppercase">
                    {formatearFechaHora(`${diaElegido}T${horaElegida}:00`)} h
                  </p>
                  <p className="text-sm text-pizarra">
                    {servicioElegido.nombre} · {servicioElegido.duracionMinutos} min · {precio(servicioElegido.precio)}
                  </p>
                </div>
              )}

              {errors.root && (
                <p
                  className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  {errors.root.message}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-lg font-semibold bg-ya-texto active:bg-ya text-white hover:bg-ya disabled:opacity-60"
                >
                  {isSubmitting ? "Reservando..." : "Confirmar turno"}
                </button>
                <Link
                  href={`/negocios/${id}`}
                  className="font-medium text-ya-texto hover:underline"
                >
                  Volver
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useParams } from "wouter";
import clienteAxios from "../../api/clienteAxios";
import Campo from "../../components/campo";
import Cargando from "../../components/cargando";
import PortadaNegocio from "../../components/portada-negocio";
import { esquemaReserva } from "../../schemas/turno-schemas";
import { aFechaHoraLocal, aValorInput } from "../../utils/fechas";
import { mensajeDeError } from "../../utils/errores";
import { useAvisos } from "../../hooks/use-avisos";

// C2 · POST /api/turnos  (los datos del negocio salen de GET /api/catalogo/negocios/{id})
// Los horarios que se ofrecen salen de GET /api/servicios/{id}/disponibilidad?fecha=:
// el back ya descarta los que estan fuera del horario de atencion, los ocupados, los pasados
// y aquellos en los que el servicio no termina antes del cierre.
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
  } = useForm({ resolver: zodResolver(esquemaReserva) });

  // Se actualizan cada vez que cambia el servicio o el dia
  const servicioId = useWatch({ control, name: "servicioId" });
  const diaElegido = useWatch({ control, name: "dia" });

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

  // El input de tipo "date" usa el formato "2026-11-26": son los primeros 10 caracteres del valor de aValorInput
  const ahora = new Date();
  const hoy = aValorInput(ahora).slice(0, 10);
  const ultimoDia = aValorInput(
    new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + dias),
  ).slice(0, 10);

  // Estado del selector de horario, segun lo que ya llego del back
  const claveActual =
    servicioId && diaElegido ? `${servicioId}|${diaElegido}|${recarga}` : "";
  const buscandoHorarios =
    claveActual !== "" && disponibilidad.clave !== claveActual;
  const horarios =
    claveActual !== "" && !buscandoHorarios ? disponibilidad.lista : [];
  const errorHorarios =
    claveActual !== "" && !buscandoHorarios ? disponibilidad.error : "";

  let textoHorario = "Elegí un horario";
  if (!claveActual) textoHorario = "Primero elegí el servicio y el día";
  else if (buscandoHorarios) textoHorario = "Buscando horarios libres...";
  else if (horarios.length === 0) textoHorario = "No hay horarios libres ese día";

  return (
    <section className="max-w-xl mx-auto">
      <div className="overflow-hidden rounded-2xl border border-borde bg-white">
        <PortadaNegocio rubro={negocio.rubro} imagen={negocio.bannerUrl} alto="h-24" />
        <div className="p-8">
          <h1 className="text-3xl font-bold">Reservar turno</h1>
          <p className="mt-1 text-pizarra">{negocio.nombre}</p>

          {servicios.length === 0 ? (
            <p className="mt-6 text-pizarra">
              Este negocio todavía no tiene servicios disponibles.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 flex flex-col gap-4"
              noValidate
            >
              <div>
                <label
                  htmlFor="servicioId"
                  className="block text-sm font-medium mb-1"
                >
                  Servicio
                </label>
                <select
                  id="servicioId"
                  aria-invalid={errors.servicioId ? "true" : "false"}
                  className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya ${
                    errors.servicioId ? "border-red-600" : "border-borde"
                  }`}
                  {...register("servicioId", { onChange: limpiarHora })}
                >
                  <option value="">Elegí un servicio</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre} · {servicio.duracionMinutos} min · $
                      {servicio.precio.toLocaleString("es-AR")}
                    </option>
                  ))}
                </select>
                {errors.servicioId && (
                  <p className="mt-1 text-sm text-red-700">
                    {errors.servicioId.message}
                  </p>
                )}
              </div>

              <Campo
                id="dia"
                label="Día"
                type="date"
                min={hoy}
                max={ultimoDia}
                ayuda={`Se puede reservar hasta ${dias} días adelante.`}
                error={errors.dia}
                {...register("dia", { onChange: limpiarHora })}
              />

              <div>
                <label htmlFor="hora" className="block text-sm font-medium mb-1">
                  Horario
                </label>
                <select
                  id="hora"
                  disabled={horarios.length === 0}
                  aria-invalid={errors.hora ? "true" : "false"}
                  className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya disabled:opacity-60 ${
                    errors.hora ? "border-red-600" : "border-borde"
                  }`}
                  {...register("hora")}
                >
                  <option value="">
                    {textoHorario}
                  </option>
                  {horarios.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
                {errorHorarios ? (
                  <p className="mt-1 text-sm text-red-700">{errorHorarios}</p>
                ) : (
                  <p className="mt-1 text-sm text-pizarra">
                    Solo aparecen los horarios libres en los que el servicio
                    entra completo dentro del horario de atención.
                  </p>
                )}
                {errors.hora && (
                  <p className="mt-1 text-sm text-red-700">
                    {errors.hora.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="notas" className="block text-sm font-medium mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  id="notas"
                  rows={3}
                  aria-invalid={errors.notas ? "true" : "false"}
                  className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya ${
                    errors.notas ? "border-red-600" : "border-borde"
                  }`}
                  {...register("notas")}
                />
                {errors.notas && (
                  <p className="mt-1 text-sm text-red-700">
                    {errors.notas.message}
                  </p>
                )}
              </div>

              {errors.root && (
                <p
                  className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  {errors.root.message}
                </p>
              )}

              <div className="mt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-lg font-semibold bg-ya text-turno hover:brightness-95 disabled:opacity-60"
                >
                  {isSubmitting ? "Reservando..." : "Reservar turno"}
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

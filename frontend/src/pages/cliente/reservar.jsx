import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useParams } from "wouter";
import clienteAxios from "../../api/clienteAxios";
import Campo from "../../components/campo";
import Cargando from "../../components/cargando";
import { esquemaReserva } from "../../schemas/turno-schemas";
import { aFechaHoraLocal, aValorInput } from "../../utils/fechas";
import { mensajeDeError } from "../../utils/errores";

const dosDigitos = (n) => String(n).padStart(2, "0");

// Horarios del dia cada "intervalo" minutos: "00:00", "00:30", "01:00", ...
// Asi solo se pueden elegir horarios que encajan con la grilla del negocio.
function generarHorarios(intervalo) {
  const horarios = [];
  for (let minutos = 0; minutos < 24 * 60; minutos += intervalo) {
    horarios.push(
      `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`,
    );
  }
  return horarios;
}

// C2 · POST /api/turnos  (los datos del negocio salen de GET /api/catalogo/negocios/{id})
export default function Reservar() {
  const { id } = useParams();
  const [, navegar] = useLocation();
  const [negocio, setNegocio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquemaReserva) });

  const diaElegido = watch("dia"); // Se actualiza cada vez que cambia el dia

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

  const onSubmit = async (datos) => {
    try {
      await clienteAxios.post("/turnos", {
        servicioId: Number(datos.servicioId),
        fechaHoraInicio: aFechaHoraLocal(`${datos.dia}T${datos.hora}`),
        notas: datos.notas?.trim() || null,
      });
      navegar("/mis-turnos");
    } catch (err) {
      // Horario ocupado, fuera de la anticipacion, etc.
      setError("root", { message: mensajeDeError(err) });
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
  const intervalo = negocio.intervaloTurnosMinutos;
  const dias = negocio.diasMaxAnticipacion;

  // El input de tipo "date" usa el formato "2026-11-26": son los primeros 10 caracteres del valor de aValorInput
  const hoy = aValorInput(new Date()).slice(0, 10);
  const ultimoDia = aValorInput(
    new Date(Date.now() + dias * 24 * 60 * 60 * 1000),
  ).slice(0, 10);

  // Si el dia elegido es hoy, se sacan los horarios que ya pasaron
  const horarios = diaElegido
    ? generarHorarios(intervalo).filter(
        (hora) =>
          diaElegido !== hoy ||
          new Date(`${diaElegido}T${hora}:00`) > new Date(),
      )
    : [];

  return (
    <section className="max-w-xl mx-auto">
      <div className="rounded-2xl border border-borde bg-white p-8">
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
                {...register("servicioId")}
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
              {...register("dia")}
            />

            <div>
              <label htmlFor="hora" className="block text-sm font-medium mb-1">
                Horario
              </label>
              <select
                id="hora"
                disabled={!diaElegido}
                aria-invalid={errors.hora ? "true" : "false"}
                className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya disabled:opacity-60 ${
                  errors.hora ? "border-red-600" : "border-borde"
                }`}
                {...register("hora")}
              >
                <option value="">
                  {diaElegido ? "Elegí un horario" : "Primero elegí el día"}
                </option>
                {horarios.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-pizarra">
                Los turnos empiezan cada {intervalo} minutos.
              </p>
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
    </section>
  );
}

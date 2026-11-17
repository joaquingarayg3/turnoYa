using System.Net;
using backend.Dtos.Negocio;
using backend.Dtos.Turno;
using backend.Enums;
using backend.Mapping;
using backend.Models;
using backend.Repositories;
using backend.Utils.Respuestas;

namespace backend.Services;

// Track C: reservar, confirmar, ver y cancelar turnos.
// Reglas acordadas por el grupo:
//  1. Al reservar, el turno queda Pendiente hasta que el dueño lo confirma.
//  2. Las fechas se manejan en hora local (sin zona horaria).
//  3. Cada negocio define cada cuantos minutos puede empezar un turno (IntervaloTurnosMinutos)
//     y la duracion de cada servicio es multiplo de ese intervalo (lo valida ServiciosService).
//  4. Cada negocio define hasta cuantos dias adelante se reserva (DiasMaxAnticipacion). Nunca en el pasado.
//  5. Cada negocio define hasta cuantas horas antes puede cancelar el cliente
//     (HorasToleranciaCancelacion). Despues, solo cancela el dueño.
//  6. El dueño puede reservar en su propio negocio.
//  7. Un turno ocupa a TODO el negocio: no puede haber dos turnos superpuestos
//     en el mismo negocio, aunque sean de servicios distintos.
//  8. El turno tiene que caer completo dentro de una franja del horario de atencion
//     (HorarioAtencion). Los horarios disponibles se calculan por servicio, porque
//     depende de su duracion: con 9 a 12 abierto, un servicio de 60 min no empieza a las 11:30.
public class TurnosService
{
    private readonly IRepository<Turno> _repo;
    private readonly IRepository<Servicio> _servicios;
    private readonly IRepository<HorarioAtencion> _horarios;
    private readonly NegociosService _negociosService;

    public TurnosService(
        IRepository<Turno> repo,
        IRepository<Servicio> servicios,
        IRepository<HorarioAtencion> horarios,
        NegociosService negociosService)
    {
        _repo = repo;
        _servicios = servicios;
        _horarios = horarios;
        _negociosService = negociosService;
    }

    // Horarios libres de un dia para un servicio: ["09:00", "10:30", ...]
    public async Task<List<string>> ObtenerDisponibilidad(int servicioId, DateOnly fecha)
    {
        var servicio = await ObtenerServicioReservable(servicioId);
        var inicios = await CalcularInicios(servicio, fecha);
        return inicios.Select(i => i.ToString("HH:mm")).ToList();
    }

    public async Task<TurnoDTO> Reservar(CrearTurnoDTO dto, int clienteId)
    {
        var servicio = await ObtenerServicioReservable(dto.ServicioId!.Value);

        var negocio = servicio.Negocio;
        int intervalo = negocio.IntervaloTurnosMinutos ?? NegocioDTO.INTERVALO_DEFECTO;
        int diasMax = negocio.DiasMaxAnticipacion ?? NegocioDTO.DIAS_DEFECTO;

        // Se descartan segundos para que los horarios queden prolijos
        DateTime f = dto.FechaHoraInicio!.Value;
        DateTime inicio = new DateTime(f.Year, f.Month, f.Day, f.Hour, f.Minute, 0);
        DateTime fin = inicio.AddMinutes(servicio.DuracionMinutos);

        // Regla 4: ni en el pasado ni mas alla de la anticipacion maxima
        if (inicio <= DateTime.Now)
        {
            throw new RespuestaError("No se puede reservar un turno en el pasado", HttpStatusCode.BadRequest);
        }
        if (inicio > DateTime.Now.AddDays(diasMax))
        {
            throw new RespuestaError($"Este negocio toma turnos hasta {diasMax} dias adelante", HttpStatusCode.BadRequest);
        }

        // Regla 3: el turno tiene que empezar en la grilla del negocio
        // (minutos desde las 00:00 divisibles por el intervalo)
        int minutosDelDia = inicio.Hour * 60 + inicio.Minute;
        if (minutosDelDia % intervalo != 0)
        {
            throw new RespuestaError($"Los turnos de este negocio empiezan cada {intervalo} minutos", HttpStatusCode.BadRequest);
        }

        // Regla 7: superposicion. Choca si empieza antes de que termine otro
        // y termina despues de que el otro empiece (los cancelados no cuentan)
        int negocioId = servicio.NegocioId;
        bool ocupado = await _repo.Existe(t =>
            t.Servicio.NegocioId == negocioId &&
            t.Estado != EstadoTurno.Cancelado &&
            t.FechaHoraInicio < fin &&
            t.FechaHoraFin > inicio);

        if (ocupado)
        {
            throw new RespuestaError("Ese horario ya esta ocupado, elegi otro", HttpStatusCode.BadRequest);
        }

        // Regla 8: se usa el mismo calculo que muestra el front, asi nunca se acepta
        // un horario que no se ofrecio (ni se rechaza uno que se ofrecio)
        var disponibles = await CalcularInicios(servicio, DateOnly.FromDateTime(inicio));
        if (!disponibles.Contains(inicio))
        {
            throw new RespuestaError(
                "Ese horario esta fuera del horario de atencion del negocio (o el servicio no termina antes del cierre)",
                HttpStatusCode.BadRequest);
        }

        var turno = new Turno()
        {
            ClienteId = clienteId,
            ServicioId = servicio.Id,
            FechaHoraInicio = inicio,
            FechaHoraFin = fin,
            Estado = EstadoTurno.Pendiente, // Regla 1
            Notas = dto.Notas?.Trim(),
            FechaCreacion = DateTime.Now
        };

        await _repo.CrearUno(turno);
        return (await ObtenerConDetalle(turno.Id)).ToTurnoDTO();
    }

    // Turnos del cliente logueado, los mas nuevos primero
    public async Task<List<TurnoDTO>> ObtenerMios(int clienteId)
    {
        var lista = await _repo.ObtenerTodos(
            t => t.ClienteId == clienteId,
            includes: [t => t.Servicio.Negocio, t => t.Cliente]
        );
        return lista.OrderByDescending(t => t.FechaHoraInicio).Select(t => t.ToTurnoDTO()).ToList();
    }

    // Agenda del negocio: solo su dueño. fecha es opcional (filtra un dia)
    public async Task<List<TurnoDTO>> ObtenerDeNegocio(int negocioId, DateOnly? fecha, int usuarioId)
    {
        await _negociosService.ObtenerEntidadPropia(negocioId, usuarioId);

        List<Turno> lista;
        if (fecha != null)
        {
            DateTime desde = fecha.Value.ToDateTime(TimeOnly.MinValue);
            DateTime hasta = desde.AddDays(1);
            lista = await _repo.ObtenerTodos(
                t => t.Servicio.NegocioId == negocioId && t.FechaHoraInicio >= desde && t.FechaHoraInicio < hasta,
                includes: [t => t.Servicio.Negocio, t => t.Cliente]
            );
        }
        else
        {
            lista = await _repo.ObtenerTodos(
                t => t.Servicio.NegocioId == negocioId,
                includes: [t => t.Servicio.Negocio, t => t.Cliente]
            );
        }

        return lista.OrderBy(t => t.FechaHoraInicio).Select(t => t.ToTurnoDTO()).ToList();
    }

    // Regla 1: solo el dueño confirma, y solo turnos pendientes que no empezaron
    public async Task<TurnoDTO> Confirmar(int id, int usuarioId)
    {
        var turno = await ObtenerConDetalle(id);

        if (turno.Servicio.Negocio.UsuarioId != usuarioId)
        {
            throw new RespuestaError("Solo el dueño del negocio puede confirmar turnos", HttpStatusCode.Forbidden);
        }
        if (turno.Estado != EstadoTurno.Pendiente)
        {
            throw new RespuestaError($"El turno no esta pendiente (estado actual: {turno.Estado})", HttpStatusCode.BadRequest);
        }
        if (turno.FechaHoraInicio <= DateTime.Now)
        {
            throw new RespuestaError("No se puede confirmar un turno que ya empezo", HttpStatusCode.BadRequest);
        }

        turno.Estado = EstadoTurno.Confirmado;
        await _repo.Guardar();
        return turno.ToTurnoDTO();
    }

    // Regla 5: el cliente cancela hasta N horas antes; el dueño, siempre
    public async Task<TurnoDTO> Cancelar(int id, int usuarioId)
    {
        var turno = await ObtenerConDetalle(id);

        bool esDueno = turno.Servicio.Negocio.UsuarioId == usuarioId;
        bool esCliente = turno.ClienteId == usuarioId;
        if (!esCliente && !esDueno)
        {
            throw new RespuestaError("No tenes permiso sobre este turno", HttpStatusCode.Forbidden);
        }
        if (turno.Estado == EstadoTurno.Cancelado)
        {
            throw new RespuestaError("El turno ya estaba cancelado", HttpStatusCode.BadRequest);
        }
        if (turno.Estado == EstadoTurno.Completado)
        {
            throw new RespuestaError("No se puede cancelar un turno completado", HttpStatusCode.BadRequest);
        }

        // Si el usuario es dueño (aunque tambien sea el cliente), no tiene limite
        if (!esDueno)
        {
            int tolerancia = turno.Servicio.Negocio.HorasToleranciaCancelacion ?? NegocioDTO.TOLERANCIA_DEFECTO;
            if (DateTime.Now > turno.FechaHoraInicio.AddHours(-tolerancia))
            {
                throw new RespuestaError(
                    $"Solo se puede cancelar hasta {tolerancia} horas antes. Comunicate con el negocio",
                    HttpStatusCode.BadRequest);
            }
        }

        turno.Estado = EstadoTurno.Cancelado;
        await _repo.Guardar();
        return turno.ToTurnoDTO();
    }

    // Calcula a que horas puede empezar el servicio ese dia. Un inicio es valido si:
    //  - cae en la grilla del negocio (Regla 3),
    //  - el servicio completo entra en una franja de atencion (Regla 8),
    //  - no esta en el pasado ni mas alla de la anticipacion maxima (Regla 4),
    //  - no se superpone con otro turno no cancelado del negocio (Regla 7).
    // Ejemplo: abierto 9 a 12, intervalo 30, ya hay un turno 10:00-10:30.
    //   Servicio de 30 min -> 09:00, 09:30, 10:30, 11:00, 11:30
    //   Servicio de 60 min -> 09:00, 10:30, 11:00
    private async Task<List<DateTime>> CalcularInicios(Servicio servicio, DateOnly fecha)
    {
        var negocio = servicio.Negocio;
        int intervalo = negocio.IntervaloTurnosMinutos ?? NegocioDTO.INTERVALO_DEFECTO;
        int diasMax = negocio.DiasMaxAnticipacion ?? NegocioDTO.DIAS_DEFECTO;
        int duracion = servicio.DuracionMinutos;

        DateTime ahora = DateTime.Now;
        DateTime limite = ahora.AddDays(diasMax);
        DateTime comienzoDia = fecha.ToDateTime(TimeOnly.MinValue);
        DateTime finDia = comienzoDia.AddDays(1);

        var franjas = await _horarios.ObtenerTodos(h => h.NegocioId == negocio.Id && h.DiaSemana == fecha.DayOfWeek);

        // Turnos del negocio que tocan ese dia (de cualquier servicio)
        var ocupados = await _repo.ObtenerTodos(t =>
            t.Servicio.NegocioId == negocio.Id &&
            t.Estado != EstadoTurno.Cancelado &&
            t.FechaHoraInicio < finDia &&
            t.FechaHoraFin > comienzoDia);

        var inicios = new List<DateTime>();
        foreach (var franja in franjas.OrderBy(h => h.HoraDesde))
        {
            int desde = franja.HoraDesde.Hour * 60 + franja.HoraDesde.Minute;
            int hasta = franja.HoraHasta.Hour * 60 + franja.HoraHasta.Minute;

            // Primer punto de la grilla dentro de la franja (si abre 9:15 con intervalo 30 -> 9:30)
            int primero = (desde + intervalo - 1) / intervalo * intervalo;

            for (int minuto = primero; minuto + duracion <= hasta; minuto += intervalo)
            {
                DateTime inicio = comienzoDia.AddMinutes(minuto);
                DateTime fin = inicio.AddMinutes(duracion);

                if (inicio <= ahora || inicio > limite) continue;
                if (ocupados.Any(t => t.FechaHoraInicio < fin && t.FechaHoraFin > inicio)) continue;

                inicios.Add(inicio);
            }
        }
        return inicios;
    }

    // El servicio tiene que existir y estar activo, igual que su negocio
    private async Task<Servicio> ObtenerServicioReservable(int servicioId)
    {
        var servicio = await _servicios.ObtenerUno(s => s.Id == servicioId, includes: [s => s.Negocio, s => s.Negocio.Usuario]);

        if (servicio == null)
        {
            throw new RespuestaError("El servicio no existe", HttpStatusCode.NotFound);
        }
        // Tampoco se reserva en negocios sin aprobar o de un dueño dado de baja por el Admin
        if (!servicio.IsActivo
            || !servicio.Negocio.IsActivo
            || servicio.Negocio.EstadoAprobacion != EstadoAprobacion.Aprobado
            || !servicio.Negocio.Usuario.IsActivo)
        {
            throw new RespuestaError("El servicio no esta disponible", HttpStatusCode.BadRequest);
        }
        return servicio;
    }

    private async Task<Turno> ObtenerConDetalle(int id)
    {
        var turno = await _repo.ObtenerUno(
            t => t.Id == id,
            includes: [t => t.Servicio.Negocio, t => t.Cliente]
        );
        if (turno == null)
        {
            throw new RespuestaError($"El turno con id = {id} no se encontro", HttpStatusCode.NotFound);
        }
        return turno;
    }
}

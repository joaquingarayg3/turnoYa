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
//  3. Cada negocio define cada cuantos minutos puede empezar un turno (IntervaloTurnosMinutos).
//  4. Cada negocio define hasta cuantos dias adelante se reserva (DiasMaxAnticipacion). Nunca en el pasado.
//  5. Cada negocio define hasta cuantas horas antes puede cancelar el cliente
//     (HorasToleranciaCancelacion). Despues, solo cancela el dueño.
//  6. El dueño puede reservar en su propio negocio.
//  7. Un turno ocupa a TODO el negocio: no puede haber dos turnos superpuestos
//     en el mismo negocio, aunque sean de servicios distintos.
public class TurnosService
{
    private readonly IRepository<Turno> _repo;
    private readonly IRepository<Servicio> _servicios;
    private readonly NegociosService _negociosService;

    public TurnosService(IRepository<Turno> repo, IRepository<Servicio> servicios, NegociosService negociosService)
    {
        _repo = repo;
        _servicios = servicios;
        _negociosService = negociosService;
    }

    public async Task<TurnoDTO> Reservar(CrearTurnoDTO dto, int clienteId)
    {
        var servicio = await _servicios.ObtenerUno(s => s.Id == dto.ServicioId, includes: [s => s.Negocio]);

        if (servicio == null)
        {
            throw new RespuestaError("El servicio no existe", HttpStatusCode.NotFound);
        }
        if (!servicio.IsActivo || !servicio.Negocio.IsActivo)
        {
            throw new RespuestaError("El servicio no esta disponible", HttpStatusCode.BadRequest);
        }

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

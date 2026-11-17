using System.Net;
using backend.Dtos.Negocio;
using backend.Dtos.Servicio;
using backend.Mapping;
using backend.Models;
using backend.Repositories;
using backend.Utils.Respuestas;

namespace backend.Services;

// Track B: servicios que ofrece cada negocio (solo los gestiona su dueño)
public class ServiciosService
{
    private readonly IRepository<Servicio> _repo;
    private readonly NegociosService _negociosService;

    public ServiciosService(IRepository<Servicio> repo, NegociosService negociosService)
    {
        _repo = repo;
        _negociosService = negociosService;
    }

    // Todos los servicios del negocio (activos e inactivos), para el panel del dueño
    public async Task<List<ServicioDTO>> ObtenerDeNegocio(int negocioId, int usuarioId)
    {
        await _negociosService.ObtenerEntidadPropia(negocioId, usuarioId);
        var lista = await _repo.ObtenerTodos(s => s.NegocioId == negocioId);
        return lista.OrderBy(s => s.Nombre).Select(s => s.ToServicioDTO()).ToList();
    }

    public async Task<ServicioDTO> CrearUno(int negocioId, CrearServicioDTO dto, int usuarioId)
    {
        var negocio = await _negociosService.ObtenerEntidadPropia(negocioId, usuarioId);
        ValidarDuracion(dto.DuracionMinutos!.Value, negocio);

        var servicio = new Servicio()
        {
            NegocioId = negocioId,
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            DuracionMinutos = dto.DuracionMinutos!.Value,
            Precio = dto.Precio!.Value,
            IsActivo = true
        };

        await _repo.CrearUno(servicio);
        return servicio.ToServicioDTO();
    }

    public async Task<ServicioDTO> ActualizarUno(int id, ActualizarServicioDTO dto, int usuarioId)
    {
        var servicio = await ObtenerEntidadPropia(id, usuarioId);

        if (dto.Nombre != null) servicio.Nombre = dto.Nombre.Trim();
        if (dto.Descripcion != null) servicio.Descripcion = dto.Descripcion.Trim();
        if (dto.DuracionMinutos != null) servicio.DuracionMinutos = dto.DuracionMinutos.Value;
        if (dto.Precio != null) servicio.Precio = dto.Precio.Value;
        // Baja / alta logica: los turnos ya tomados se conservan
        if (dto.IsActivo != null) servicio.IsActivo = (bool)dto.IsActivo;

        // Un servicio inactivo no se reserva, asi que solo se exige el multiplo si queda activo
        if (servicio.IsActivo) ValidarDuracion(servicio.DuracionMinutos, servicio.Negocio);

        await _repo.Guardar();
        return servicio.ToServicioDTO();
    }

    // La duracion tiene que ser multiplo del intervalo del negocio (ej: intervalo 30 -> 30, 60, 90 min).
    // Asi cada turno empieza y termina sobre la grilla y no quedan huecos sueltos en la agenda.
    private static void ValidarDuracion(int duracion, Negocio negocio)
    {
        int intervalo = negocio.IntervaloTurnosMinutos ?? NegocioDTO.INTERVALO_DEFECTO;
        if (duracion % intervalo != 0)
        {
            throw new RespuestaError(
                $"La duracion tiene que ser multiplo de {intervalo} minutos (el intervalo de turnos del negocio)",
                HttpStatusCode.BadRequest);
        }
    }

    private async Task<Servicio> ObtenerEntidadPropia(int id, int usuarioId)
    {
        var servicio = await _repo.ObtenerUno(s => s.Id == id, includes: [s => s.Negocio]);
        if (servicio == null)
        {
            throw new RespuestaError($"El servicio con id = {id} no se encontro", HttpStatusCode.NotFound);
        }
        if (servicio.Negocio.UsuarioId != usuarioId)
        {
            throw new RespuestaError("No tenes permiso sobre este servicio", HttpStatusCode.Forbidden);
        }
        return servicio;
    }
}

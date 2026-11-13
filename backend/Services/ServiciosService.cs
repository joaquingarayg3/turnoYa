using System.Net;
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
        await _negociosService.ObtenerEntidadPropia(negocioId, usuarioId);

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

        await _repo.Guardar();
        return servicio.ToServicioDTO();
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

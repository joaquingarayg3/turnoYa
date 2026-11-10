using System.Net;
using backend.Dtos.Negocio;
using backend.Models;
using backend.Repositories;
using backend.Utils.Respuestas;

namespace backend.Services;

// Track A: lo que el comerciante hace sobre SUS negocios.
// Los permisos se validan por dueño (negocio.UsuarioId), no por rol.
public class NegociosService
{
    private readonly IRepository<Negocio> _repo;

    public NegociosService(IRepository<Negocio> repo)
    {
        _repo = repo;
    }

    public async Task<List<NegocioDTO>> ObtenerMios(int usuarioId)
    {
        var lista = await _repo.ObtenerTodos(n => n.UsuarioId == usuarioId, includes: [n => n.Servicios]);
        return lista.OrderBy(n => n.Nombre).Select(n => NegocioDTO.DesdeModelo(n)).ToList();
    }

    public async Task<NegocioDTO> ObtenerPropioPorId(int id, int usuarioId)
    {
        var negocio = await ObtenerEntidadPropia(id, usuarioId, incluirServicios: true);
        return NegocioDTO.DesdeModelo(negocio);
    }

    public async Task<NegocioDTO> CrearUno(CrearNegocioDTO dto, int usuarioId)
    {
        var negocio = new Negocio()
        {
            UsuarioId = usuarioId,
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Rubro = dto.Rubro.Trim(),
            Direccion = dto.Direccion?.Trim(),
            Telefono = dto.Telefono?.Trim(),
            IsActivo = true,
            IntervaloTurnosMinutos = dto.IntervaloTurnosMinutos ?? NegocioDTO.INTERVALO_DEFECTO,
            DiasMaxAnticipacion = dto.DiasMaxAnticipacion ?? NegocioDTO.DIAS_DEFECTO,
            HorasToleranciaCancelacion = dto.HorasToleranciaCancelacion ?? NegocioDTO.TOLERANCIA_DEFECTO
        };

        await _repo.CrearUno(negocio);
        return NegocioDTO.DesdeModelo(negocio);
    }

    public async Task<NegocioDTO> ActualizarUno(int id, ActualizarNegocioDTO dto, int usuarioId)
    {
        var negocio = await ObtenerEntidadPropia(id, usuarioId);

        if (dto.Nombre != null) negocio.Nombre = dto.Nombre.Trim();
        if (dto.Descripcion != null) negocio.Descripcion = dto.Descripcion.Trim();
        if (dto.Rubro != null) negocio.Rubro = dto.Rubro.Trim();
        if (dto.Direccion != null) negocio.Direccion = dto.Direccion.Trim();
        if (dto.Telefono != null) negocio.Telefono = dto.Telefono.Trim();
        if (dto.IntervaloTurnosMinutos != null) negocio.IntervaloTurnosMinutos = dto.IntervaloTurnosMinutos;
        if (dto.DiasMaxAnticipacion != null) negocio.DiasMaxAnticipacion = dto.DiasMaxAnticipacion;
        if (dto.HorasToleranciaCancelacion != null) negocio.HorasToleranciaCancelacion = dto.HorasToleranciaCancelacion;

        await _repo.Guardar();
        return NegocioDTO.DesdeModelo(negocio);
    }

    // Baja / alta logica: no se borra para no perder los turnos
    public async Task<NegocioDTO> CambiarEstado(int id, bool isActivo, int usuarioId)
    {
        var negocio = await ObtenerEntidadPropia(id, usuarioId);
        negocio.IsActivo = isActivo;
        await _repo.Guardar();
        return NegocioDTO.DesdeModelo(negocio);
    }

    // Devuelve el negocio solo si existe (404) y es del usuario (403).
    // Lo reutilizan ServiciosService y TurnosService.
    public async Task<Negocio> ObtenerEntidadPropia(int id, int usuarioId, bool incluirServicios = false)
    {
        Negocio? negocio = incluirServicios
            ? await _repo.ObtenerUno(n => n.Id == id, includes: [n => n.Servicios])
            : await _repo.ObtenerUno(n => n.Id == id);

        if (negocio == null)
        {
            throw new RespuestaError($"El negocio con id = {id} no se encontro", HttpStatusCode.NotFound);
        }
        if (negocio.UsuarioId != usuarioId)
        {
            throw new RespuestaError("No tenes permiso sobre este negocio", HttpStatusCode.Forbidden);
        }
        return negocio;
    }
}

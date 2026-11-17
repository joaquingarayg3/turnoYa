using System.Net;
using backend.Dtos.Comun;
using backend.Dtos.Negocio;
using backend.Enums;
using backend.Mapping;
using backend.Models;
using backend.Repositories;
using backend.Utils.Respuestas;

namespace backend.Services;

// Track A: lo que el comerciante hace sobre SUS negocios.
// Los permisos se validan por dueño (negocio.UsuarioId), no por rol.
// Ademas: listado, moderacion y aprobacion de negocios para el Admin.
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
        return lista.OrderBy(n => n.Nombre).Select(n => n.ToNegocioDTO()).ToList();
    }

    // Admin: todos los negocios de todos los dueños (activos e inactivos), con los datos del dueño,
    // sus servicios y sus horarios (el panel los muestra en el resumen para decidir si aprobarlo)
    public async Task<List<NegocioDTO>> ObtenerTodos()
    {
        var lista = await _repo.ObtenerTodos(includes: [n => n.Servicios, n => n.Usuario, n => n.Horarios]);
        // Primero los pendientes de aprobacion, que son los que el Admin tiene que revisar
        return lista
            .OrderBy(n => n.EstadoAprobacion == EstadoAprobacion.Pendiente ? 0 : 1)
            .ThenBy(n => n.Nombre)
            .Select(n => n.ToNegocioDTO())
            .ToList();
    }

    // Admin: moderacion. Activa o desactiva cualquier negocio, sin importar el dueño
    public async Task<NegocioDTO> CambiarEstado(int id, CambiarEstadoDTO dto)
    {
        var negocio = await _repo.ObtenerUno(n => n.Id == id, includes: [n => n.Servicios, n => n.Usuario, n => n.Horarios]);
        if (negocio == null)
        {
            throw new RespuestaError("El negocio no existe", HttpStatusCode.NotFound);
        }

        negocio.IsActivo = dto.IsActivo!.Value;
        await _repo.ActualizarUno(negocio);
        return negocio.ToNegocioDTO();
    }

    // Admin: aprobar o rechazar (con motivo) un negocio
    public async Task<NegocioDTO> DecidirAprobacion(int id, AprobacionDTO dto)
    {
        var negocio = await _repo.ObtenerUno(n => n.Id == id, includes: [n => n.Servicios, n => n.Usuario, n => n.Horarios]);
        if (negocio == null)
        {
            throw new RespuestaError("El negocio no existe", HttpStatusCode.NotFound);
        }

        if (dto.Aprobado == true)
        {
            negocio.EstadoAprobacion = EstadoAprobacion.Aprobado;
            negocio.MotivoRechazo = null;
        }
        else
        {
            if (string.IsNullOrWhiteSpace(dto.Motivo))
            {
                throw new RespuestaError("Indica el motivo del rechazo: el dueño lo va a ver", HttpStatusCode.BadRequest);
            }
            negocio.EstadoAprobacion = EstadoAprobacion.Rechazado;
            negocio.MotivoRechazo = dto.Motivo.Trim();
        }

        await _repo.ActualizarUno(negocio);
        return negocio.ToNegocioDTO();
    }

    public async Task<NegocioDTO> ObtenerPropioPorId(int id, int usuarioId)
    {
        var negocio = await ObtenerEntidadPropia(id, usuarioId, incluirServicios: true);
        return negocio.ToNegocioDTO();
    }

    // esAdmin: los negocios que crea el staff no necesitan aprobacion
    public async Task<NegocioDTO> CrearUno(CrearNegocioDTO dto, int usuarioId, bool esAdmin)
    {
        ValidarRubro(dto.Rubro);

        var negocio = new Negocio()
        {
            UsuarioId = usuarioId,
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Rubro = dto.Rubro.Trim(),
            Direccion = dto.Direccion?.Trim(),
            Telefono = dto.Telefono?.Trim(),
            BannerUrl = NormalizarBanner(dto.BannerUrl),
            IsActivo = true,
            EstadoAprobacion = esAdmin ? EstadoAprobacion.Aprobado : EstadoAprobacion.Pendiente,
            IntervaloTurnosMinutos = dto.IntervaloTurnosMinutos ?? NegocioDTO.INTERVALO_DEFECTO,
            DiasMaxAnticipacion = dto.DiasMaxAnticipacion ?? NegocioDTO.DIAS_DEFECTO,
            HorasToleranciaCancelacion = dto.HorasToleranciaCancelacion ?? NegocioDTO.TOLERANCIA_DEFECTO
        };

        await _repo.CrearUno(negocio);
        return negocio.ToNegocioDTO();
    }

    public async Task<NegocioDTO> ActualizarUno(int id, ActualizarNegocioDTO dto, int usuarioId)
    {
        // Si cambia el intervalo hacen falta los servicios para validarlo
        var negocio = await ObtenerEntidadPropia(id, usuarioId, incluirServicios: dto.IntervaloTurnosMinutos != null);

        if (dto.IntervaloTurnosMinutos != null)
        {
            // Los servicios activos tienen que seguir siendo multiplo del nuevo intervalo
            int nuevo = dto.IntervaloTurnosMinutos.Value;
            var incompatibles = negocio.Servicios
                .Where(s => s.IsActivo && s.DuracionMinutos % nuevo != 0)
                .Select(s => $"{s.Nombre} ({s.DuracionMinutos} min)")
                .ToList();
            if (incompatibles.Count > 0)
            {
                throw new RespuestaError(
                    $"No se puede cambiar el intervalo a {nuevo} minutos: estos servicios no son multiplo: {string.Join(", ", incompatibles)}. Cambia su duracion o desactivalos primero",
                    HttpStatusCode.BadRequest);
            }
            negocio.IntervaloTurnosMinutos = nuevo;
        }

        if (dto.Nombre != null) negocio.Nombre = dto.Nombre.Trim();
        if (dto.Descripcion != null) negocio.Descripcion = dto.Descripcion.Trim();
        if (dto.Rubro != null)
        {
            ValidarRubro(dto.Rubro);
            negocio.Rubro = dto.Rubro.Trim();
        }
        if (dto.Direccion != null) negocio.Direccion = dto.Direccion.Trim();
        if (dto.Telefono != null) negocio.Telefono = dto.Telefono.Trim();
        // "" borra la imagen y vuelve a la portada del rubro
        if (dto.BannerUrl != null) negocio.BannerUrl = NormalizarBanner(dto.BannerUrl);
        if (dto.DiasMaxAnticipacion != null) negocio.DiasMaxAnticipacion = dto.DiasMaxAnticipacion;
        if (dto.HorasToleranciaCancelacion != null) negocio.HorasToleranciaCancelacion = dto.HorasToleranciaCancelacion;
        // Baja / alta logica: no se borra para no perder los turnos
        if (dto.IsActivo != null) negocio.IsActivo = (bool)dto.IsActivo;

        // Si el Admin lo rechazo y el dueño corrige los datos (el formulario siempre manda el nombre),
        // vuelve a quedar Pendiente para una nueva revision
        if (negocio.EstadoAprobacion == EstadoAprobacion.Rechazado && dto.Nombre != null)
        {
            negocio.EstadoAprobacion = EstadoAprobacion.Pendiente;
            negocio.MotivoRechazo = null;
        }

        await _repo.Guardar();
        return negocio.ToNegocioDTO();
    }

    // Portada: vacio = null (portada del rubro); si viene, tiene que ser un link http o https valido
    private static string? NormalizarBanner(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;

        string link = url.Trim();
        bool valido = Uri.TryCreate(link, UriKind.Absolute, out Uri? uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
        if (!valido)
        {
            throw new RespuestaError("La imagen de portada tiene que ser un link que empiece con http:// o https://", HttpStatusCode.BadRequest);
        }
        return link;
    }

    // El rubro tiene que ser uno de la lista cerrada (Enums/RUBROS.cs)
    private static void ValidarRubro(string rubro)
    {
        if (!RUBROS.TODOS.Contains(rubro.Trim()))
        {
            throw new RespuestaError(
                $"El rubro tiene que ser uno de estos: {string.Join(", ", RUBROS.TODOS)}",
                HttpStatusCode.BadRequest);
        }
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

using backend.Dtos.Negocio;
using backend.Dtos.Servicio;
using backend.Dtos.Turno;
using backend.Dtos.Usuario;
using backend.Models;

namespace backend.Mapping;

// Mapeo explicito entidad -> DTO (teoria, capitulo 3: "Pasar de DTO a entidad: el mapeo").
// Uso: usuario.ToUsuarioDTO(), negocio.ToNegocioDTO(), etc.
// Los DTO de salida nunca exponen la clave ni datos internos de la entidad.
public static class Mapper
{
    public static UsuarioDTO ToUsuarioDTO(this Usuario u) => new()
    {
        Id = u.Id,
        Nombre = u.Nombre,
        Apellido = u.Apellido,
        Email = u.Email,
        Telefono = u.Telefono,
        FechaRegistro = u.FechaRegistro,
        Roles = u.Roles.Select(r => r.Nombre).ToList()
    };

    public static ServicioDTO ToServicioDTO(this Servicio s) => new()
    {
        Id = s.Id,
        NegocioId = s.NegocioId,
        Nombre = s.Nombre,
        Descripcion = s.Descripcion,
        DuracionMinutos = s.DuracionMinutos,
        Precio = s.Precio,
        IsActivo = s.IsActivo
    };

    // soloServiciosActivos = true para el catalogo publico
    public static NegocioDTO ToNegocioDTO(this Negocio n, bool soloServiciosActivos = false) => new()
    {
        Id = n.Id,
        UsuarioId = n.UsuarioId,
        Nombre = n.Nombre,
        Descripcion = n.Descripcion,
        Rubro = n.Rubro,
        Direccion = n.Direccion,
        Telefono = n.Telefono,
        IsActivo = n.IsActivo,
        IntervaloTurnosMinutos = n.IntervaloTurnosMinutos ?? NegocioDTO.INTERVALO_DEFECTO,
        DiasMaxAnticipacion = n.DiasMaxAnticipacion ?? NegocioDTO.DIAS_DEFECTO,
        HorasToleranciaCancelacion = n.HorasToleranciaCancelacion ?? NegocioDTO.TOLERANCIA_DEFECTO,
        Servicios = n.Servicios
            .Where(s => !soloServiciosActivos || s.IsActivo)
            .OrderBy(s => s.Nombre)
            .Select(s => s.ToServicioDTO())
            .ToList()
    };

    // Requiere haber incluido Servicio.Negocio y Cliente en la consulta
    public static TurnoDTO ToTurnoDTO(this Turno t) => new()
    {
        Id = t.Id,
        FechaHoraInicio = t.FechaHoraInicio,
        FechaHoraFin = t.FechaHoraFin,
        Estado = t.Estado,
        Notas = t.Notas,
        ServicioId = t.ServicioId,
        ServicioNombre = t.Servicio?.Nombre ?? string.Empty,
        ServicioPrecio = t.Servicio?.Precio ?? 0,
        NegocioId = t.Servicio?.NegocioId ?? 0,
        NegocioNombre = t.Servicio?.Negocio?.Nombre ?? string.Empty,
        NegocioDireccion = t.Servicio?.Negocio?.Direccion,
        ClienteId = t.ClienteId,
        ClienteNombre = t.Cliente == null ? string.Empty : $"{t.Cliente.Nombre} {t.Cliente.Apellido}",
        ClienteTelefono = t.Cliente?.Telefono
    };
}

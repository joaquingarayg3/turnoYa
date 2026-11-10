using backend.Enums;

namespace backend.Dtos.Turno;

public class TurnoDTO
{
    public int Id { get; set; }
    public DateTime FechaHoraInicio { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public EstadoTurno Estado { get; set; }
    public string? Notas { get; set; }

    public int ServicioId { get; set; }
    public string ServicioNombre { get; set; } = string.Empty;
    public decimal ServicioPrecio { get; set; }

    public int NegocioId { get; set; }
    public string NegocioNombre { get; set; } = string.Empty;
    public string? NegocioDireccion { get; set; }

    // Solo nombre y telefono: lo que el negocio necesita para contactar al cliente
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string? ClienteTelefono { get; set; }

    // Requiere haber incluido Servicio.Negocio y Cliente en la consulta
    public static TurnoDTO DesdeModelo(Models.Turno t) => new()
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

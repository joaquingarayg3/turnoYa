using backend.Dtos.Servicio;

namespace backend.Dtos.Negocio;

public class NegocioDTO
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Rubro { get; set; } = string.Empty;
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public bool IsActivo { get; set; }

    // Siempre con valor: si el negocio no lo configuro, va el valor por defecto
    public int IntervaloTurnosMinutos { get; set; }
    public int DiasMaxAnticipacion { get; set; }
    public int HorasToleranciaCancelacion { get; set; }

    public List<ServicioDTO> Servicios { get; set; } = new();

    // Valores por defecto de la configuracion de turnos
    public const int INTERVALO_DEFECTO = 30;
    public const int DIAS_DEFECTO = 30;
    public const int TOLERANCIA_DEFECTO = 2;

    // soloServiciosActivos = true para el catalogo publico
    public static NegocioDTO DesdeModelo(Models.Negocio n, bool soloServiciosActivos = false) => new()
    {
        Id = n.Id,
        UsuarioId = n.UsuarioId,
        Nombre = n.Nombre,
        Descripcion = n.Descripcion,
        Rubro = n.Rubro,
        Direccion = n.Direccion,
        Telefono = n.Telefono,
        IsActivo = n.IsActivo,
        IntervaloTurnosMinutos = n.IntervaloTurnosMinutos ?? INTERVALO_DEFECTO,
        DiasMaxAnticipacion = n.DiasMaxAnticipacion ?? DIAS_DEFECTO,
        HorasToleranciaCancelacion = n.HorasToleranciaCancelacion ?? TOLERANCIA_DEFECTO,
        Servicios = n.Servicios
            .Where(s => !soloServiciosActivos || s.IsActivo)
            .OrderBy(s => s.Nombre)
            .Select(ServicioDTO.DesdeModelo)
            .ToList()
    };
}

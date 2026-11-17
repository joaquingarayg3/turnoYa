using backend.Dtos.Horario;
using backend.Dtos.Servicio;
using backend.Enums;

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
    public string? BannerUrl { get; set; }
    public bool IsActivo { get; set; }

    // Moderacion: "Pendiente", "Aprobado" o "Rechazado" (con el motivo)
    public EstadoAprobacion EstadoAprobacion { get; set; }
    public string? MotivoRechazo { get; set; }

    // Datos del dueño: solo se completan en el listado del Admin (consulta con n.Usuario incluido)
    public string? PropietarioNombre { get; set; }
    public string? PropietarioEmail { get; set; }
    public bool? PropietarioActivo { get; set; }

    // Siempre con valor: si el negocio no lo configuro, va el valor por defecto
    public int IntervaloTurnosMinutos { get; set; }
    public int DiasMaxAnticipacion { get; set; }
    public int HorasToleranciaCancelacion { get; set; }

    public List<ServicioDTO> Servicios { get; set; } = new();

    // Horarios de atencion (se completan en el detalle del catalogo)
    public List<HorarioDTO> Horarios { get; set; } = new();

    // Valores por defecto de la configuracion de turnos
    public const int INTERVALO_DEFECTO = 30;
    public const int DIAS_DEFECTO = 30;
    public const int TOLERANCIA_DEFECTO = 2;
}

using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Turno;

public class CrearTurnoDTO
{
    [Required(ErrorMessage = "El servicio es requerido")]
    public int? ServicioId { get; set; }

    // Hora local, sin zona horaria. Ej: "2026-11-12T10:00:00"
    [Required(ErrorMessage = "La fecha y hora son requeridas")]
    public DateTime? FechaHoraInicio { get; set; }

    [MaxLength(300, ErrorMessage = "Maximo 300 caracteres")]
    public string? Notas { get; set; }
}

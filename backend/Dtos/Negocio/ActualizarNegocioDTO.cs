using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Negocio;

// Todos los campos son opcionales: solo se actualiza lo que llega
public class ActualizarNegocioDTO
{
    [MinLength(2, ErrorMessage = "Minimo 2 caracteres")]
    [MaxLength(100, ErrorMessage = "Maximo 100 caracteres")]
    public string? Nombre { get; set; }

    [MaxLength(500, ErrorMessage = "Maximo 500 caracteres")]
    public string? Descripcion { get; set; }

    [MinLength(2, ErrorMessage = "Minimo 2 caracteres")]
    [MaxLength(60, ErrorMessage = "Maximo 60 caracteres")]
    public string? Rubro { get; set; }

    [MaxLength(150, ErrorMessage = "Maximo 150 caracteres")]
    public string? Direccion { get; set; }

    [MaxLength(30, ErrorMessage = "Maximo 30 caracteres")]
    public string? Telefono { get; set; }

    [Range(5, 240, ErrorMessage = "El intervalo debe estar entre 5 y 240 minutos")]
    public int? IntervaloTurnosMinutos { get; set; }

    [Range(1, 365, ErrorMessage = "La anticipacion debe estar entre 1 y 365 dias")]
    public int? DiasMaxAnticipacion { get; set; }

    [Range(0, 168, ErrorMessage = "La tolerancia debe estar entre 0 y 168 horas")]
    public int? HorasToleranciaCancelacion { get; set; }
}

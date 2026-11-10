using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Servicio;

// Todos los campos son opcionales: solo se actualiza lo que llega
public class ActualizarServicioDTO
{
    [MinLength(2, ErrorMessage = "Minimo 2 caracteres")]
    [MaxLength(100, ErrorMessage = "Maximo 100 caracteres")]
    public string? Nombre { get; set; }

    [MaxLength(500, ErrorMessage = "Maximo 500 caracteres")]
    public string? Descripcion { get; set; }

    [Range(5, 480, ErrorMessage = "La duracion debe estar entre 5 y 480 minutos")]
    public int? DuracionMinutos { get; set; }

    [Range(0.0, 9999999.0, ErrorMessage = "El precio no puede ser negativo")]
    public decimal? Precio { get; set; }
}

using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Negocio;

// Decision del Admin sobre un negocio. Ej:
// { "aprobado": true }   o   { "aprobado": false, "motivo": "Faltan datos de contacto" }
public class AprobacionDTO
{
    [Required(ErrorMessage = "Indica si se aprueba (true) o se rechaza (false)")]
    public bool? Aprobado { get; set; }

    // Obligatorio al rechazar (lo valida NegociosService): el dueño lo ve en "Mis negocios"
    [MaxLength(300, ErrorMessage = "Maximo 300 caracteres")]
    public string? Motivo { get; set; }
}

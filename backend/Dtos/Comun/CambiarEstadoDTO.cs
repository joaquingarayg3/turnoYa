using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Comun;

// Lo usa el Admin para dar de baja / reactivar usuarios y negocios (baja logica).
// Ej: { "isActivo": false }
public class CambiarEstadoDTO
{
    [Required(ErrorMessage = "Indica si queda activo (true) o inactivo (false)")]
    public bool? IsActivo { get; set; }
}

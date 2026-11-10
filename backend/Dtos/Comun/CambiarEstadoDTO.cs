using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Comun;

// Baja / alta logica de negocios y servicios
public class CambiarEstadoDTO
{
    [Required(ErrorMessage = "Debe indicar si queda activo o no")]
    public bool? IsActivo { get; set; }
}

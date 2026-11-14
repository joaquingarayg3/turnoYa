using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Usuario;

public class ActualizarRolesDTO
{
    [Required]
    [MinLength(1, ErrorMessage = "Debe indicar al menos un rol")]
    public List<int> RolesIds { get; set; } = new();
}

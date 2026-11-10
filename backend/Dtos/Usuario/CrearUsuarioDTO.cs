using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Usuario;

public class CrearUsuarioDTO
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MinLength(2, ErrorMessage = "Minimo 2 caracteres")]
    [MaxLength(60)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido")]
    [MinLength(2, ErrorMessage = "Minimo 2 caracteres")]
    [MaxLength(60)]
    public string Apellido { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email invalido")]
    [MaxLength(120)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La clave es requerida")]
    [MinLength(6, ErrorMessage = "La clave debe tener al menos 6 caracteres")]
    public string Clave { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? Telefono { get; set; }
}

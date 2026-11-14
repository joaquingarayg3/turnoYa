using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Auth;

public class LoginDTO
{
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email invalido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La clave es requerida")]
    public string Clave { get; set; } = string.Empty;
}

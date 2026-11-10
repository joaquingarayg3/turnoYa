using backend.Dtos.Usuario;

namespace backend.Dtos.Auth;

public class LoginRespuestaDTO
{
    public string Token { get; set; } = string.Empty;
    public UsuarioDTO Usuario { get; set; } = null!;
}

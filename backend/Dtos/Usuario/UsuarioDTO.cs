namespace backend.Dtos.Usuario;

// Lo que se devuelve al front: nunca incluye la clave
public class UsuarioDTO
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public DateTime FechaRegistro { get; set; }
    public List<string> Roles { get; set; } = new();
}

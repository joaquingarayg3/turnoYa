using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Usuario
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [MaxLength(60)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Apellido { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Email { get; set; } = string.Empty;

    // Hash BCrypt, nunca la clave en texto plano
    public string Clave { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? Telefono { get; set; }

    public DateTime FechaRegistro { get; set; }

    public List<Rol> Roles { get; set; } = new();
    public List<Negocio> Negocios { get; set; } = new();
    public List<Turno> Turnos { get; set; } = new();
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Servicio
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int NegocioId { get; set; }
    public Negocio Negocio { get; set; } = null!;

    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    // Define cuanto dura cada turno de este servicio
    public int DuracionMinutos { get; set; }

    public decimal Precio { get; set; }

    public bool IsActivo { get; set; } = true;

    public List<Turno> Turnos { get; set; } = new();
}

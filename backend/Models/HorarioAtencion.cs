using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

// Un negocio puede tener varios tramos por dia (ej: 9-13 y 17-21)
public class HorarioAtencion
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int NegocioId { get; set; }
    public Negocio Negocio { get; set; } = null!;

    // Domingo = 0 ... Sabado = 6
    public DayOfWeek DiaSemana { get; set; }

    public TimeOnly HoraDesde { get; set; }
    public TimeOnly HoraHasta { get; set; }
}

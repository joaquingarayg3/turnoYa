using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Horario;

// Una franja de la semana que manda el dueño. Ej:
// { "diaSemana": "Monday", "horaDesde": "09:00:00", "horaHasta": "13:00:00" }
public class CrearHorarioDTO
{
    [Required(ErrorMessage = "El dia es requerido")]
    public DayOfWeek? DiaSemana { get; set; }

    [Required(ErrorMessage = "La hora de apertura es requerida")]
    public TimeOnly? HoraDesde { get; set; }

    [Required(ErrorMessage = "La hora de cierre es requerida")]
    public TimeOnly? HoraHasta { get; set; }
}

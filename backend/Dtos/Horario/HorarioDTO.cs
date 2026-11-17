namespace backend.Dtos.Horario;

// Una franja de atencion del negocio.
// En el JSON el dia viaja como texto ("Monday") y las horas como "09:00:00".
public class HorarioDTO
{
    public int Id { get; set; }
    public DayOfWeek DiaSemana { get; set; }
    public TimeOnly HoraDesde { get; set; }
    public TimeOnly HoraHasta { get; set; }
}

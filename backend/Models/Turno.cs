using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Enums;

namespace backend.Models;

public class Turno
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    // Usuario que reserva el turno
    public int ClienteId { get; set; }
    public Usuario Cliente { get; set; } = null!;

    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;

    public DateTime FechaHoraInicio { get; set; }

    // Se guarda (inicio + duracion del servicio) para simplificar
    // la consulta de superposicion de turnos
    public DateTime FechaHoraFin { get; set; }

    public EstadoTurno Estado { get; set; } = EstadoTurno.Pendiente;

    [MaxLength(300)]
    public string? Notas { get; set; }

    public DateTime FechaCreacion { get; set; }
}

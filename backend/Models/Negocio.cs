using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Negocio
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    // Dueño del negocio (cualquier usuario puede crear uno)
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    [MaxLength(60)]
    public string Rubro { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Direccion { get; set; }

    [MaxLength(30)]
    public string? Telefono { get; set; }

    public bool IsActivo { get; set; } = true;

    // ---- Configuracion de turnos (la define el dueño) ----
    // Son nullable para que la migracion no rompa negocios ya cargados:
    // null = se usa el valor por defecto (ver TurnosService).

    // Cada cuantos minutos puede empezar un turno (ej: 30 -> 9:00, 9:30, 10:00...)
    public int? IntervaloTurnosMinutos { get; set; }

    // Hasta cuantos dias adelante se puede reservar
    public int? DiasMaxAnticipacion { get; set; }

    // Hasta cuantas horas antes del turno el cliente puede cancelar.
    // Pasado ese limite, solo cancela el dueño.
    public int? HorasToleranciaCancelacion { get; set; }

    public List<Servicio> Servicios { get; set; } = new();
    public List<HorarioAtencion> Horarios { get; set; } = new();
}

namespace backend.Dtos.Servicio;

public class ServicioDTO
{
    public int Id { get; set; }
    public int NegocioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int DuracionMinutos { get; set; }
    public decimal Precio { get; set; }
    public bool IsActivo { get; set; }
}

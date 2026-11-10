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

    public static ServicioDTO DesdeModelo(Models.Servicio s) => new()
    {
        Id = s.Id,
        NegocioId = s.NegocioId,
        Nombre = s.Nombre,
        Descripcion = s.Descripcion,
        DuracionMinutos = s.DuracionMinutos,
        Precio = s.Precio,
        IsActivo = s.IsActivo
    };
}

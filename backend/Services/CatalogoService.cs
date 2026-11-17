using System.Net;
using backend.Dtos.Negocio;
using backend.Enums;
using backend.Mapping;
using backend.Models;
using backend.Repositories;
using backend.Utils.Respuestas;

namespace backend.Services;

// Track D: lo que ve cualquier visitante (sin login). Solo negocios y servicios activos,
// solo aprobados por un Admin, y solo de dueños activos (si el Admin da de baja a un usuario,
// sus negocios se ocultan).
public class CatalogoService
{
    private readonly IRepository<Negocio> _repo;

    public CatalogoService(IRepository<Negocio> repo)
    {
        _repo = repo;
    }

    // busqueda: texto en nombre o descripcion. rubro: coincidencia exacta. Ambos opcionales.
    public async Task<List<NegocioDTO>> Buscar(string? busqueda, string? rubro)
    {
        string texto = busqueda?.Trim() ?? string.Empty;
        string filtroRubro = rubro?.Trim() ?? string.Empty;
        bool sinTexto = texto.Length == 0;
        bool sinRubro = filtroRubro.Length == 0;

        var lista = await _repo.ObtenerTodos(
            n => n.IsActivo && n.Usuario.IsActivo && n.EstadoAprobacion == EstadoAprobacion.Aprobado
                && (sinTexto || n.Nombre.Contains(texto) || (n.Descripcion != null && n.Descripcion.Contains(texto)))
                && (sinRubro || n.Rubro == filtroRubro),
            includes: [n => n.Servicios]
        );

        return lista.OrderBy(n => n.Nombre).Select(n => n.ToNegocioDTO(true)).ToList();
    }

    // Detalle con servicios activos y horarios de atencion
    public async Task<NegocioDTO> ObtenerPorId(int id)
    {
        var negocio = await _repo.ObtenerUno(n => n.Id == id && n.IsActivo && n.Usuario.IsActivo && n.EstadoAprobacion == EstadoAprobacion.Aprobado, includes: [n => n.Servicios, n => n.Horarios]);
        if (negocio == null)
        {
            throw new RespuestaError("El negocio no existe o no esta disponible", HttpStatusCode.NotFound);
        }
        return negocio.ToNegocioDTO(true);
    }

    // Rubros distintos de los negocios activos, para el filtro del front
    public async Task<List<string>> ObtenerRubros()
    {
        var lista = await _repo.ObtenerTodos(n => n.IsActivo && n.Usuario.IsActivo && n.EstadoAprobacion == EstadoAprobacion.Aprobado);
        return lista.Select(n => n.Rubro).Distinct().OrderBy(r => r).ToList();
    }
}

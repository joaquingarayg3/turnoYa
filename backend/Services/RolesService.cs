using System.Net;
using backend.Models;
using backend.Repositories;
using backend.Utils.Respuestas;

namespace backend.Services;

public class RolesService
{
    private readonly IRepository<Rol> _repo;
    public RolesService(IRepository<Rol> repo)
    {
        _repo = repo;
    }

    public async Task<List<Rol>> ObtenerTodos() => await _repo.ObtenerTodos();

    public async Task<Rol> ObtenerUnoPorNombre(string nombre)
    {
        var rol = await _repo.ObtenerUno(r => r.Nombre == nombre);
        if (rol == null)
        {
            throw new RespuestaError("El rol no se encontro", HttpStatusCode.NotFound);
        }
        return rol;
    }

    public async Task<List<Rol>> ObtenerPorIds(List<int> ids)
    {
        if (ids == null || ids.Count == 0)
        {
            throw new RespuestaError("La lista esta vacia", HttpStatusCode.BadRequest);
        }

        var roles = await _repo.ObtenerTodos(r => ids.Contains(r.Id));
        if (roles.Count != ids.Distinct().Count())
        {
            throw new RespuestaError("Uno o mas roles no existen", HttpStatusCode.BadRequest);
        }
        return roles;
    }
}

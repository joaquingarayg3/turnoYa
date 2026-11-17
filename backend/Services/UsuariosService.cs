using System.Net;
using backend.Dtos.Comun;
using backend.Dtos.Usuario;
using backend.Enums;
using backend.Mapping;
using backend.Models;
using backend.Repositories;
using backend.Utils.Respuestas;

namespace backend.Services;

public class UsuariosService
{
    private readonly IRepository<Usuario> _repo;
    private readonly RolesService _rolesService;
    private readonly IEncoderService _encoder;

    public UsuariosService(IRepository<Usuario> repo, RolesService rolesService, IEncoderService encoder)
    {
        _repo = repo;
        _rolesService = rolesService;
        _encoder = encoder;
    }

    public async Task<List<UsuarioDTO>> ObtenerTodos()
    {
        var lista = await _repo.ObtenerTodos(includes: [u => u.Roles]);
        return lista.OrderBy(u => u.Id).Select(u => u.ToUsuarioDTO()).ToList();
    }

    public async Task<Usuario> ObtenerUnoPorId(int id)
    {
        var u = await _repo.ObtenerUno(u => u.Id == id, includes: [u => u.Roles]);
        if (u == null)
        {
            throw new RespuestaError($"El usuario con id = {id} no se encontro", HttpStatusCode.NotFound);
        }
        return u;
    }

    public async Task<Usuario?> BuscarPorEmail(string email)
    {
        string normalizado = email.Trim().ToLower();
        return await _repo.ObtenerUno(u => u.Email == normalizado, includes: [u => u.Roles]);
    }

    public async Task<UsuarioDTO> CrearUno(CrearUsuarioDTO dto)
    {
        string email = dto.Email.Trim().ToLower();

        if (await _repo.Existe(u => u.Email == email))
        {
            throw new RespuestaError("Ya existe una cuenta con ese email", HttpStatusCode.BadRequest);
        }

        // Todos se registran como User. Ser "comerciante" = tener al menos un Negocio.
        var rol = await _rolesService.ObtenerUnoPorNombre(ROL.USER);

        var usuario = new Usuario()
        {
            Nombre = dto.Nombre.Trim(),
            Apellido = dto.Apellido.Trim(),
            Email = email,
            Telefono = dto.Telefono,
            Clave = _encoder.Encode(dto.Clave),
            FechaRegistro = DateTime.UtcNow,
            Roles = new List<Rol>() { rol }
        };

        await _repo.CrearUno(usuario);
        return usuario.ToUsuarioDTO();
    }

    // adminId = quien hace el cambio (sale del token)
    public async Task<UsuarioDTO> ActualizarRolesPorId(int id, ActualizarRolesDTO dto, int adminId)
    {
        Usuario usuario = await ObtenerUnoPorId(id);
        var roles = await _rolesService.ObtenerPorIds(dto.RolesIds);

        // Proteccion: el admin no puede quitarse su propio rol (podria quedar la app sin admin)
        if (id == adminId && !roles.Any(r => r.Nombre == ROL.ADMIN))
        {
            throw new RespuestaError("No podes quitarte el rol Admin a vos mismo", HttpStatusCode.BadRequest);
        }

        usuario.Roles = roles;
        await _repo.ActualizarUno(usuario);
        return usuario.ToUsuarioDTO();
    }

    // Admin: baja logica o reactivacion de un usuario
    public async Task<UsuarioDTO> CambiarEstado(int id, CambiarEstadoDTO dto, int adminId)
    {
        if (id == adminId && dto.IsActivo == false)
        {
            throw new RespuestaError("No podes darte de baja a vos mismo", HttpStatusCode.BadRequest);
        }

        Usuario usuario = await ObtenerUnoPorId(id);
        usuario.IsActivo = dto.IsActivo!.Value;
        await _repo.ActualizarUno(usuario);
        return usuario.ToUsuarioDTO();
    }
}

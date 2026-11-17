using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos.Comun;
using backend.Enums;
using backend.Services;
using backend.Utils.Extensions;
using backend.Utils.Respuestas;

namespace backend.Controllers;

// Panel de staff: solo Admin
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = ROL.ADMIN)]
[ProducesResponseType(typeof(Respuesta), StatusCodes.Status500InternalServerError)]
public class UsuariosController : ControllerBase
{
    private readonly UsuariosService _service;
    private readonly RolesService _rolesService;

    public UsuariosController(UsuariosService service, RolesService rolesService)
    {
        _service = service;
        _rolesService = rolesService;
    }

    // GET api/usuarios
    [HttpGet]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    public async Task<ActionResult<Respuesta>> ObtenerTodos()
    {
        try
        {
            var todos = await _service.ObtenerTodos();
            var exito = new RespuestaExito("Usuarios obtenidos!", HttpStatusCode.OK, todos);
            return StatusCode((int)exito.CodigoEstado, exito.Res);
        }
        catch (Exception error)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new Respuesta(error.Message));
        }
    }

    // PUT api/usuarios/{id}/estado  { "isActivo": false } -> baja logica (o reactivar)
    [HttpPut("{id}/estado")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> CambiarEstado(int id, [FromBody] CambiarEstadoDTO dto)
    {
        try
        {
            var usuario = await _service.CambiarEstado(id, dto, User.ObtenerUsuarioId());
            string mensaje = usuario.IsActivo ? "Usuario reactivado!" : "Usuario dado de baja!";
            var exito = new RespuestaExito(mensaje, HttpStatusCode.OK, usuario);
            return StatusCode((int)exito.CodigoEstado, exito.Res);
        }
        catch (RespuestaError error)
        {
            return StatusCode((int)error.CodigoEstado, error.Res);
        }
        catch (Exception error)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new Respuesta(error.Message));
        }
    }

    // GET api/usuarios/roles
    [HttpGet("roles")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    public async Task<ActionResult<Respuesta>> ObtenerRoles()
    {
        try
        {
            var roles = await _rolesService.ObtenerTodos();
            var exito = new RespuestaExito("Roles obtenidos!", HttpStatusCode.OK, roles);
            return StatusCode((int)exito.CodigoEstado, exito.Res);
        }
        catch (Exception error)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new Respuesta(error.Message));
        }
    }
}

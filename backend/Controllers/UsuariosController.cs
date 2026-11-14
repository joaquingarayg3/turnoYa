using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Enums;
using backend.Services;
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

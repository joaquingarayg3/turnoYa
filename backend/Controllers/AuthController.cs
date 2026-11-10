using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos.Auth;
using backend.Dtos.Usuario;
using backend.Enums;
using backend.Services;
using backend.Utils.Extensions;
using backend.Utils.Respuestas;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[ProducesResponseType(typeof(Respuesta), StatusCodes.Status500InternalServerError)]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly UsuariosService _usuarioService;

    public AuthController(IAuthService auth, UsuariosService usuarioService)
    {
        _auth = auth;
        _usuarioService = usuarioService;
    }

    // POST api/auth/login
    [HttpPost("login")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Respuesta>> Login([FromBody] LoginDTO dto)
    {
        try
        {
            var response = await _auth.Login(dto);
            var exito = new RespuestaExito("Bienvenido!", HttpStatusCode.OK, response);
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

    // POST api/auth/register
    [HttpPost("register")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Respuesta>> Register([FromBody] CrearUsuarioDTO dto)
    {
        try
        {
            var usuario = await _usuarioService.CrearUno(dto);
            var exito = new RespuestaExito("Usuario creado!", HttpStatusCode.Created, usuario);
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

    // GET api/auth/me -> datos del usuario logueado (lo usa el front al recargar la pagina)
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Respuesta>> Me()
    {
        try
        {
            int id = User.ObtenerUsuarioId();
            var usuario = await _usuarioService.ObtenerUnoPorId(id);
            var exito = new RespuestaExito("Usuario actual", HttpStatusCode.OK, UsuarioDTO.DesdeModelo(usuario));
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

    // PUT api/auth/roles/{usuarioId} -> solo staff
    [HttpPut("roles/{usuarioId}")]
    [Authorize(Roles = ROL.ADMIN)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ActualizarRoles(int usuarioId, [FromBody] ActualizarRolesDTO dto)
    {
        try
        {
            var usuario = await _usuarioService.ActualizarRolesPorId(usuarioId, dto);
            var exito = new RespuestaExito("Roles actualizados!", HttpStatusCode.OK, usuario);
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
}

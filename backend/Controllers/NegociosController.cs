using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos.Negocio;
using backend.Services;
using backend.Utils.Extensions;
using backend.Utils.Respuestas;

namespace backend.Controllers;

// Track A: panel del comerciante. Todo requiere login y se valida que el negocio sea del usuario.
[ApiController]
[Route("api/[controller]")]
[Authorize]
[ProducesResponseType(typeof(Respuesta), StatusCodes.Status500InternalServerError)]
public class NegociosController : ControllerBase
{
    private readonly NegociosService _service;

    public NegociosController(NegociosService service)
    {
        _service = service;
    }

    // GET api/negocios/mios
    [HttpGet("mios")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    public async Task<ActionResult<Respuesta>> ObtenerMios()
    {
        try
        {
            var lista = await _service.ObtenerMios(User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Negocios obtenidos!", HttpStatusCode.OK, lista);
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

    // GET api/negocios/{id}
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ObtenerUno(int id)
    {
        try
        {
            var negocio = await _service.ObtenerPropioPorId(id, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Negocio obtenido!", HttpStatusCode.OK, negocio);
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

    // POST api/negocios
    [HttpPost]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Respuesta>> CrearUno([FromBody] CrearNegocioDTO dto)
    {
        try
        {
            var negocio = await _service.CrearUno(dto, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Negocio creado!", HttpStatusCode.Created, negocio);
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

    // PUT api/negocios/{id}
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ActualizarUno(int id, [FromBody] ActualizarNegocioDTO dto)
    {
        try
        {
            var negocio = await _service.ActualizarUno(id, dto, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Negocio actualizado!", HttpStatusCode.OK, negocio);
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

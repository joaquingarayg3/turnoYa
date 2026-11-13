using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos.Servicio;
using backend.Services;
using backend.Utils.Extensions;
using backend.Utils.Respuestas;

namespace backend.Controllers;

// Track B: servicios de un negocio. Solo el dueño del negocio los gestiona.
[ApiController]
[Route("api")]
[Authorize]
[ProducesResponseType(typeof(Respuesta), StatusCodes.Status500InternalServerError)]
public class ServiciosController : ControllerBase
{
    private readonly ServiciosService _service;

    public ServiciosController(ServiciosService service)
    {
        _service = service;
    }

    // GET api/negocios/{negocioId}/servicios
    [HttpGet("negocios/{negocioId}/servicios")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ObtenerDeNegocio(int negocioId)
    {
        try
        {
            var lista = await _service.ObtenerDeNegocio(negocioId, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Servicios obtenidos!", HttpStatusCode.OK, lista);
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

    // POST api/negocios/{negocioId}/servicios
    [HttpPost("negocios/{negocioId}/servicios")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<Respuesta>> CrearUno(int negocioId, [FromBody] CrearServicioDTO dto)
    {
        try
        {
            var servicio = await _service.CrearUno(negocioId, dto, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Servicio creado!", HttpStatusCode.Created, servicio);
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

    // PUT api/servicios/{id}
    [HttpPut("servicios/{id}")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ActualizarUno(int id, [FromBody] ActualizarServicioDTO dto)
    {
        try
        {
            var servicio = await _service.ActualizarUno(id, dto, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Servicio actualizado!", HttpStatusCode.OK, servicio);
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

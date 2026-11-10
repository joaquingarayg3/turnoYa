using System.Net;
using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Utils.Respuestas;

namespace backend.Controllers;

// Track D: catalogo publico (sin login). Es lo que ve el cliente para elegir donde reservar.
[ApiController]
[Route("api/[controller]")]
[ProducesResponseType(typeof(Respuesta), StatusCodes.Status500InternalServerError)]
public class CatalogoController : ControllerBase
{
    private readonly CatalogoService _service;

    public CatalogoController(CatalogoService service)
    {
        _service = service;
    }

    // GET api/catalogo/negocios?busqueda=pelu&rubro=Peluqueria
    [HttpGet("negocios")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    public async Task<ActionResult<Respuesta>> Buscar([FromQuery] string? busqueda, [FromQuery] string? rubro)
    {
        try
        {
            var lista = await _service.Buscar(busqueda, rubro);
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

    // GET api/catalogo/negocios/{id}  (detalle con sus servicios activos)
    [HttpGet("negocios/{id}")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ObtenerUno(int id)
    {
        try
        {
            var negocio = await _service.ObtenerPorId(id);
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

    // GET api/catalogo/rubros
    [HttpGet("rubros")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    public async Task<ActionResult<Respuesta>> ObtenerRubros()
    {
        try
        {
            var rubros = await _service.ObtenerRubros();
            var exito = new RespuestaExito("Rubros obtenidos!", HttpStatusCode.OK, rubros);
            return StatusCode((int)exito.CodigoEstado, exito.Res);
        }
        catch (Exception error)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new Respuesta(error.Message));
        }
    }
}

using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos.Horario;
using backend.Services;
using backend.Utils.Extensions;
using backend.Utils.Respuestas;

namespace backend.Controllers;

// Track B: horarios de atencion de un negocio. Solo su dueño los ve y los modifica
// (el cliente los ve en el detalle del catalogo).
[ApiController]
[Route("api")]
[Authorize]
[ProducesResponseType(typeof(Respuesta), StatusCodes.Status500InternalServerError)]
public class HorariosController : ControllerBase
{
    private readonly HorariosService _service;

    public HorariosController(HorariosService service)
    {
        _service = service;
    }

    // GET api/negocios/{negocioId}/horarios
    [HttpGet("negocios/{negocioId}/horarios")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ObtenerDeNegocio(int negocioId)
    {
        try
        {
            var lista = await _service.ObtenerDeNegocio(negocioId, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Horarios obtenidos!", HttpStatusCode.OK, lista);
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

    // PUT api/negocios/{negocioId}/horarios  (reemplaza la semana completa)
    [HttpPut("negocios/{negocioId}/horarios")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> Reemplazar(int negocioId, [FromBody] List<CrearHorarioDTO> dto)
    {
        try
        {
            var lista = await _service.Reemplazar(negocioId, dto, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Horarios guardados!", HttpStatusCode.OK, lista);
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

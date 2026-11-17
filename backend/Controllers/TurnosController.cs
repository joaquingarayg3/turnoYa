using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos.Turno;
using backend.Services;
using backend.Utils.Extensions;
using backend.Utils.Respuestas;

namespace backend.Controllers;

// Track C: reservas. Todo requiere login, salvo consultar la disponibilidad.
[ApiController]
[Route("api")]
[Authorize]
[ProducesResponseType(typeof(Respuesta), StatusCodes.Status500InternalServerError)]
public class TurnosController : ControllerBase
{
    private readonly TurnosService _service;

    public TurnosController(TurnosService service)
    {
        _service = service;
    }

    // GET api/servicios/{servicioId}/disponibilidad?fecha=2026-11-17
    // Horarios libres de ese dia en los que entra el servicio completo. Es publico, como el catalogo.
    [HttpGet("servicios/{servicioId}/disponibilidad")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ObtenerDisponibilidad(int servicioId, [FromQuery] DateOnly? fecha)
    {
        try
        {
            if (fecha == null)
            {
                throw new RespuestaError("La fecha es requerida (formato 2026-11-17)", HttpStatusCode.BadRequest);
            }
            var horarios = await _service.ObtenerDisponibilidad(servicioId, fecha.Value);
            var exito = new RespuestaExito("Disponibilidad obtenida!", HttpStatusCode.OK, horarios);
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

    // POST api/turnos
    [HttpPost("turnos")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> Reservar([FromBody] CrearTurnoDTO dto)
    {
        try
        {
            var turno = await _service.Reservar(dto, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Turno reservado!", HttpStatusCode.Created, turno);
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

    // GET api/turnos/mios
    [HttpGet("turnos/mios")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    public async Task<ActionResult<Respuesta>> ObtenerMios()
    {
        try
        {
            var lista = await _service.ObtenerMios(User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Turnos obtenidos!", HttpStatusCode.OK, lista);
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

    // GET api/negocios/{negocioId}/turnos?fecha=2026-11-12  (agenda, solo el dueño)
    [HttpGet("negocios/{negocioId}/turnos")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> ObtenerDeNegocio(int negocioId, [FromQuery] DateOnly? fecha)
    {
        try
        {
            var lista = await _service.ObtenerDeNegocio(negocioId, fecha, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Agenda obtenida!", HttpStatusCode.OK, lista);
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

    // PUT api/turnos/{id}/confirmar  (solo el dueño del negocio)
    [HttpPut("turnos/{id}/confirmar")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> Confirmar(int id)
    {
        try
        {
            var turno = await _service.Confirmar(id, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Turno confirmado!", HttpStatusCode.OK, turno);
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

    // PUT api/turnos/{id}/cancelar
    [HttpPut("turnos/{id}/cancelar")]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Respuesta), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Respuesta>> Cancelar(int id)
    {
        try
        {
            var turno = await _service.Cancelar(id, User.ObtenerUsuarioId());
            var exito = new RespuestaExito("Turno cancelado!", HttpStatusCode.OK, turno);
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

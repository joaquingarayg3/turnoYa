using System.Net;
using backend.Dtos.Horario;
using backend.Mapping;
using backend.Models;
using backend.Repositories;
using backend.Utils.Respuestas;

namespace backend.Services;

// Track B: horarios de atencion semanales del negocio (solo los gestiona su dueño).
// - Un dia sin franjas = el negocio no atiende ese dia.
// - Puede haber varias franjas por dia (horario cortado: 9 a 13 y 17 a 21), sin superponerse.
// - Con estas franjas TurnosService calcula los horarios disponibles para reservar.
public class HorariosService
{
    private static readonly string[] DIAS = { "Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado" };

    private readonly IRepository<HorarioAtencion> _repo;
    private readonly NegociosService _negociosService;

    public HorariosService(IRepository<HorarioAtencion> repo, NegociosService negociosService)
    {
        _repo = repo;
        _negociosService = negociosService;
    }

    public async Task<List<HorarioDTO>> ObtenerDeNegocio(int negocioId, int usuarioId)
    {
        await _negociosService.ObtenerEntidadPropia(negocioId, usuarioId);
        var lista = await _repo.ObtenerTodos(h => h.NegocioId == negocioId);
        return Mapper.OrdenarSemana(lista).Select(h => h.ToHorarioDTO()).ToList();
    }

    // Reemplaza la semana completa: se borran las franjas anteriores y se guardan las nuevas.
    // Asi el front edita toda la semana en un solo formulario (una lista vacia = no atiende nunca).
    public async Task<List<HorarioDTO>> Reemplazar(int negocioId, List<CrearHorarioDTO> dto, int usuarioId)
    {
        await _negociosService.ObtenerEntidadPropia(negocioId, usuarioId);

        var nuevos = dto.Select(h => new HorarioAtencion()
        {
            NegocioId = negocioId,
            DiaSemana = h.DiaSemana!.Value,
            HoraDesde = h.HoraDesde!.Value,
            HoraHasta = h.HoraHasta!.Value
        }).ToList();

        // Se valida todo antes de borrar nada
        Validar(nuevos);

        var anteriores = await _repo.ObtenerTodos(h => h.NegocioId == negocioId);
        foreach (var horario in anteriores)
        {
            await _repo.EliminarUno(horario);
        }
        foreach (var horario in nuevos)
        {
            await _repo.CrearUno(horario);
        }

        return Mapper.OrdenarSemana(nuevos).Select(h => h.ToHorarioDTO()).ToList();
    }

    private static void Validar(List<HorarioAtencion> horarios)
    {
        foreach (var h in horarios)
        {
            if (h.HoraDesde >= h.HoraHasta)
            {
                throw new RespuestaError(
                    $"{DIAS[(int)h.DiaSemana]}: la hora de cierre ({h.HoraHasta:HH:mm}) tiene que ser posterior a la de apertura ({h.HoraDesde:HH:mm})",
                    HttpStatusCode.BadRequest);
            }
        }

        // Dentro de cada dia, ordenadas por apertura: cada franja tiene que empezar
        // cuando (o despues de que) termina la anterior
        foreach (var dia in horarios.GroupBy(h => h.DiaSemana))
        {
            var franjas = dia.OrderBy(h => h.HoraDesde).ToList();
            for (int i = 1; i < franjas.Count; i++)
            {
                var anterior = franjas[i - 1];
                var actual = franjas[i];
                if (actual.HoraDesde < anterior.HoraHasta)
                {
                    throw new RespuestaError(
                        $"{DIAS[(int)dia.Key]}: las franjas {anterior.HoraDesde:HH:mm}-{anterior.HoraHasta:HH:mm} y {actual.HoraDesde:HH:mm}-{actual.HoraHasta:HH:mm} se superponen",
                        HttpStatusCode.BadRequest);
                }
            }
        }
    }
}

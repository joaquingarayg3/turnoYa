using System.Net;
using System.Security.Claims;
using backend.Utils.Respuestas;

namespace backend.Utils.Extensions;

public static class ClaimsPrincipalExtensions
{
    // Uso en un controller: int usuarioId = User.ObtenerUsuarioId();
    // Sirve para validar que el negocio/turno pertenece al usuario logueado
    public static int ObtenerUsuarioId(this ClaimsPrincipal user)
    {
        string? id = user.FindFirst("Id")?.Value;
        if (id == null || !int.TryParse(id, out int usuarioId))
        {
            throw new RespuestaError("Token invalido", HttpStatusCode.Unauthorized);
        }
        return usuarioId;
    }
}

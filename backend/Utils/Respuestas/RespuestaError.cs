using System.Net;

namespace backend.Utils.Respuestas;

public class RespuestaError : Exception
{
    public Respuesta Res { get; set; }
    public HttpStatusCode CodigoEstado { get; }

    public RespuestaError(string mensaje, HttpStatusCode codigo) : base(mensaje)
    {
        Res = new Respuesta(mensaje);
        CodigoEstado = codigo;
    }
}

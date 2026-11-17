namespace backend.Enums;

// Rubros permitidos para un negocio (lista cerrada). El front muestra la misma lista en un
// desplegable y elige la portada del negocio segun el rubro (src/utils/rubros.js).
public static class RUBROS
{
    public const string BARBERIA = "Barbería y peluquería";
    public const string ESTETICA = "Estética y belleza";
    public const string SALUD = "Salud";
    public const string TALLER = "Taller mecánico";
    public const string GIMNASIO = "Gimnasio y deportes";
    public const string VETERINARIA = "Veterinaria";
    public const string OTROS = "Otros";

    public static readonly string[] TODOS = { BARBERIA, ESTETICA, SALUD, TALLER, GIMNASIO, VETERINARIA, OTROS };
}

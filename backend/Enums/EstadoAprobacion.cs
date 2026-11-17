namespace backend.Enums;

// Moderacion de comercios: todo negocio nuevo queda Pendiente hasta que un Admin lo revisa.
// Solo los Aprobados aparecen en el catalogo y aceptan reservas.
public enum EstadoAprobacion
{
    Pendiente,
    Aprobado,
    Rechazado
}

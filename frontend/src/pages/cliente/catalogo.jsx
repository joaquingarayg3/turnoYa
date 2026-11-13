import Pendiente from "../../components/pendiente"

// D5 · GET /api/catalogo/negocios?busqueda=&rubro=  y  GET /api/catalogo/rubros
export default function Catalogo() {
  return (
    <Pendiente titulo="Encontrá dónde sacar tu turno" tarea="D5 · Catálogo">
      Tarjetas de negocios con buscador, filtro por rubro y estados de carga, vacío y error.
    </Pendiente>
  )
}

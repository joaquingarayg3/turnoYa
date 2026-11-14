import { Link } from "wouter"
import { Isotipo } from "../components/logo"

export default function NoEncontrado() {
  return (
    <section className="text-center py-16 flex flex-col items-center">
      <Isotipo size={80} />
      <p className="mt-6 font-display text-6xl font-bold text-ya">404</p>
      <h1 className="mt-2 text-2xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-pizarra">La dirección que buscás no existe.</p>
      <Link href="/" className="inline-block mt-6 font-semibold text-ya-texto hover:underline">
        Volver al catálogo
      </Link>
    </section>
  )
}

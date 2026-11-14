import Logo from "./logo"

export default function Footer() {
  return (
    <footer className="bg-turno">
      <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-borde">
        <Logo size={24} negativo />
        <span>Pedí tu turno, ya. · Programación IV · UTN FRSN</span>
      </div>
    </footer>
  )
}

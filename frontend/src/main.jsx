import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { ProveedorAuth } from "./context/proveedor-auth"

// El proveedor envuelve la app (modulo 05): cualquier componente puede leer la sesion con useAuth()
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProveedorAuth>
      <App />
    </ProveedorAuth>
  </StrictMode>,
)

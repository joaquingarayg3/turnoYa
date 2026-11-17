import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { ProveedorAuth } from "./context/proveedor-auth"
import { ProveedorAvisos } from "./context/proveedor-avisos"

// Los proveedores envuelven la app (modulo 05): cualquier componente puede leer
// la sesion con useAuth() y mostrar avisos con useAvisos()
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProveedorAuth>
      <ProveedorAvisos>
        <App />
      </ProveedorAvisos>
    </ProveedorAuth>
  </StrictMode>,
)

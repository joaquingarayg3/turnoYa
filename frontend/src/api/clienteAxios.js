import axios from "axios"

// Instancia personalizada de Axios (modulo 08): la URL base y los headers se configuran una sola vez.
// La URL sale de la variable VITE_API_URL (archivo .env); si no esta, usa la del backend local.
const clienteAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://localhost:7142/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Interceptor de peticion: agrega el token JWT a TODAS las peticiones si hay sesion.
// Asi ningun componente tiene que acordarse de mandarlo.
clienteAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta: si el back responde 401 (token vencido o invalido),
// se borra el token y se avisa al proveedor de auth para que cierre la sesion.
clienteAxios.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.dispatchEvent(new Event("sesion-expirada"))
    }
    return Promise.reject(error)
  }
)

export default clienteAxios

# TurnoYa — Turnero universal

Trabajo práctico integrador de **Programación IV** (UTN Facultad Regional San Nicolás).

TurnoYa es una plataforma donde **cualquier persona registrada** puede:

- **Como comerciante:** crear su negocio, cargar los servicios que ofrece y sus horarios de atención, y así publicar su turnero.
- **Como cliente:** buscar y filtrar los turneros publicados y sacar un turno en el que quiera.

No hay que elegir un tipo de cuenta al registrarse. La misma cuenta puede usar los dos paneles: "ser comerciante" significa simplemente tener al menos un negocio creado. Los roles (`Admin` / `User`) solo separan al staff de la aplicación de los usuarios comunes.

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core 9 Web API (controllers) |
| Acceso a datos | Entity Framework Core 9 + SQL Server |
| Autenticación | JWT (Bearer) + contraseñas con BCrypt |
| Documentación de la API | Swagger (Swashbuckle) |
| Frontend | React 19 + Vite + Tailwind CSS 4 (pnpm) |

## Estructura del repositorio

```
turnoYa/
├── backend/            API en ASP.NET Core  → ver docs/BACKEND.md
├── frontend/           SPA en React + Vite (por ahora solo la plantilla)
├── docs/
│   └── BACKEND.md      Cómo está armado el backend, endpoints y cómo agregar módulos
├── DER_Turnero.pdf     Diagrama entidad relación
└── .gitignore
```

---

## Cómo levantar el proyecto

### Requisitos

- Visual Studio 2022 (o .NET 9 SDK)
- SQL Server Express (o LocalDB) + SQL Server Management Studio (opcional, para ver la base)
- Node.js y pnpm (para el frontend)

### 1. Configurar la conexión a tu SQL Server

La cadena de conexión **por defecto** está en `backend/appsettings.json` y apunta a `localhost\SQLEXPRESS`.

Si tu instancia se llama distinto, **no toques `appsettings.json`**. Creá el archivo `backend/appsettings.Development.json` con tu cadena:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "dbDev": "Server=NOMBRE-DE-TU-PC\\SQLEXPRESS;Database=turnoya;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

Ese archivo está en el `.gitignore`: cada uno tiene el suyo y no se pisan entre compañeros. En modo Development, .NET le da prioridad sobre `appsettings.json`.

> En JSON la barra invertida se escribe doble: `PC\\SQLEXPRESS`. Escribir el nombre de la instancia dos veces es un error común.

### 2. Base de datos

No hace falta correr nada: al ejecutar el backend se aplican solas las migraciones pendientes (`Database.Migrate()` en `Program.cs`) y se crea la base `turnoya` con sus tablas y datos iniciales (roles y usuario admin).

### 3. Ejecutar el backend

Ejecutar el proyecto `backend` con el perfil **https** y abrir:

```
https://localhost:7142/swagger
```

Usuario administrador de prueba:

| Email | Clave |
|---|---|
| `admin@turnoya.com` | `Admin1234` |

### 4. Ejecutar el frontend

```
cd frontend
pnpm install
pnpm dev
```

Queda en `http://localhost:5173`. El backend ya tiene CORS habilitado para ese origen.

---

## Reglas de trabajo en equipo

- **Ramas:** `main` protegida. Cada tarea va en su rama `feature/nombre-corto` y entra por Pull Request.
- **Commits:** mensajes descriptivos con prefijo: `feat:`, `fix:`, `docs:`, `refactor:`.
- **Migraciones:**
  - Si cambiás un modelo, generá la migración (`Add-Migration NombreDescriptivo`) y commiteala **junto con el cambio del modelo**.
  - Avisá al grupo antes de mergear una migración. Dos migraciones creadas en paralelo sobre el mismo modelo generan conflictos en `AppDbContextModelSnapshot.cs`.
  - Después de hacer pull de una migración nueva, corré `Update-Database`.
- **Nunca** subir `appsettings.Development.json`, `bin/`, `obj/` ni `node_modules/` (ya están en el `.gitignore`).

## Estado actual

- [x] Modelo de datos completo (7 tablas) con migración inicial
- [x] Registro, login con JWT, usuario actual y gestión de roles
- [x] Swagger con autenticación
- [x] API de negocios y servicios (panel comerciante, con validación de dueño y baja lógica)
- [x] API de turnos: reservar, mis turnos, cancelar y agenda del negocio
- [x] API de catálogo público con búsqueda y filtro por rubro
- [ ] Frontend: rutas, sesión, login y registro
- [ ] Frontend: catálogo, detalle y reserva
- [ ] Frontend: mis negocios, servicios y mis turnos

Fuera de alcance en esta versión: horarios de atención y cálculo de disponibilidad (las tablas existen pero no se usan), panel de admin en el front, paginación y deploy.

Detalle técnico del backend: [`docs/BACKEND.md`](docs/BACKEND.md)

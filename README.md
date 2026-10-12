# 🐾 Ximedgar — Sistema de Gestión Veterinaria

Aplicación web full stack para administrar una clínica veterinaria:
dueños, mascotas, consultas, servicios y veterinarios, con un panel de reportes.

## 👥 Integrantes

- Edgar Angulo Nolorbe
- Ximena Lozada Escobar

## 📌 Problema que resuelve

Muchas clínicas veterinarias pequeñas llevan el registro de sus pacientes, dueños y consultas en cuadernos u hojas de cálculo dispersas, lo que genera pérdida de información, duplicados y dificultad para saber cuánto se atendió o se facturó. **Ximedgar** centraliza esa información en un panel administrativo: permite registrar dueños y mascotas, llevar el historial de consultas con los servicios aplicados y obtener reportes de consultas e ingresos de forma inmediata.

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Vite, React Router, Lucide React |
| Backend | Java 25, Spring Boot 3.5.6 (Web, Data JPA, Validation, Security), Lombok |
| Seguridad | JWT (tokens de acceso) y BCrypt (contraseñas cifradas) |
| Base de datos | PostgreSQL alojado en **Neon** |
| Despliegue backend | **Railway** |
| Despliegue frontend | **Vercel** |

## 🔗 Enlaces

- **Frontend (público):** https://vet-frontend-woad.vercel.app
- **Backend (público):** https://veterinaria-production-7017.up.railway.app
- **Repositorio:** https://github.com/Erephos/Vet

## ✅ Funcionalidades implementadas

- **Autenticación:** inicio de sesión con roles (Administrador / Veterinario). Las rutas internas están protegidas con token JWT y la sesión se mantiene en el navegador.
- **Gestión de cuentas:** solo un administrador puede crear y eliminar cuentas. No se puede eliminar la propia cuenta ni al último administrador.
- **Permisos por rol:** el veterinario trabaja con dueños, mascotas y consultas; en servicios, veterinarios y catálogos solo puede consultar. El administrador puede modificar todo.
- **Inicio (dashboard):** saludo personalizado, consultas del día, total de mascotas y dueños, próximas citas, accesos rápidos y veterinarios activos.
- **Dueños:** registro, edición, eliminación y vista de detalle (nombre, teléfono, dirección).
- **Mascotas:** CRUD con dueño, raza y fecha de nacimiento, más detalle por mascota.
- **Consultas:** registro de consultas con mascota, veterinario, fecha y hora, diagnóstico y costo base, con detalle de la consulta.
- **Servicios:** catálogo de servicios con precio, asociables a cada consulta (con observaciones).
- **Veterinarios:** gestión de veterinarios con especialidad y teléfono.
- **Catálogos:** administración de especies y razas usadas al registrar mascotas.
- **Reportes:** consultas totales, ingresos totales (costo base + servicios), servicios aplicados, consultas por veterinario e ingresos por servicio.
- **Perfil:** datos de la cuenta activa y, para administradores, listado de cuentas registradas.
- **Validaciones:** el servidor rechaza datos inválidos y explica el motivo (por ejemplo, un dueño sin nombre).
- **Diseño responsive:** menú lateral adaptable a pantallas de teléfono.
- **API REST** con endpoints bajo `/api/` para: `usuarios` (incluye `/login`), `duenos`, `mascotas`, `razas`, `especies`, `consultas`, `servicios`, `veterinarios` y `detalle-consulta-servicio`.

## 💻 Ejecución local

### Requisitos previos

- [JDK 25](https://jdk.java.net/25/)
- [Maven](https://maven.apache.org/) 3.9+
- [Node.js](https://nodejs.org/) 18+ y npm
- Una base de datos PostgreSQL (puede ser una cuenta gratuita en [Neon](https://neon.tech/))

### 1. Clonar el repositorio

```bash
git clone https://github.com/Erephos/Vet.git
cd Vet
```

### 2. Backend (Spring Boot)

1. Crear en la base de datos las tablas del proyecto: `usuarios`, `veterinarios`, `duenos`, `especies`, `razas`, `mascotas`, `servicios`, `consultas` y `detalle_consulta_servicio`.
2. Definir las variables de entorno que lee `application.properties`. **Nunca** escribas sus valores reales en el repositorio.

   | Variable | Descripción | Ejemplo |
   |----------|-------------|---------|
   | `DB_URL` | URL JDBC de PostgreSQL | `jdbc:postgresql://<host>/<base>?sslmode=require` |
   | `DB_USER` | Usuario de la base de datos | `<usuario>` |
   | `DB_PASSWORD` | Contraseña de la base de datos | `<contraseña>` |
   | `JWT_SECRET` | Clave para firmar los tokens (mínimo 32 caracteres, aleatoria). Si falta, la app no arranca | `<cadena-larga-aleatoria>` |
   | `JWT_EXPIRATION_MINUTES` | Opcional. Duración del token en minutos (por defecto 480) | `480` |

   Linux / macOS:
   ```bash
   export DB_URL="jdbc:postgresql://<host>/<base>?sslmode=require"
   export DB_USER="<usuario>"
   export DB_PASSWORD="<contraseña>"
   export JWT_SECRET="<cadena-larga-aleatoria>"
   ```
   Windows (PowerShell):
   ```powershell
   $env:DB_URL="jdbc:postgresql://<host>/<base>?sslmode=require"
   $env:DB_USER="<usuario>"
   $env:DB_PASSWORD="<contraseña>"
   $env:JWT_SECRET="<cadena-larga-aleatoria>"
   ```
3. Ejecutar:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. El backend queda en **http://localhost:8080** (al iniciar imprime `CONEXION EXITOSA` si la base de datos responde).

> La primera cuenta de administrador debe crearse directamente en la tabla `usuarios` (con `rol = 'admin'`). Detalles en `backend/README.md`.

### 3. Frontend (React + Vite)

1. En otra terminal:
   ```bash
   cd frontend
   npm install
   ```
2. Crear el archivo `frontend/.env` apuntando al backend local:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
   > Si no se define, el frontend usa `http://localhost:8080/api` por defecto.
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir **http://localhost:5173** (origen permitido por el CORS del backend).

### Compilar para producción

```bash
# Frontend
cd frontend && npm run build        # genera /dist

# Backend
cd backend && mvn clean package     # genera el .jar en /target
```

## ☁️ Despliegue

- **Base de datos:** PostgreSQL en Neon.
- **Backend:** Railway, con las variables `DB_URL`, `DB_USER`, `DB_PASSWORD` y `JWT_SECRET` configuradas en la pestaña *Variables* del servicio.
- **Frontend:** Vercel, con la variable `VITE_API_URL` apuntando a la URL pública del backend; `vercel.json` redirige todas las rutas a `index.html` para que React Router funcione.

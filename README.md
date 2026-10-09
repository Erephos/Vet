# 🐾 Ximedgar — Sistema de Gestión Veterinaria

Aplicación web full stack para administrar una clínica veterinaria: 
dueños, mascotas, consultas, servicios y veterinarios, con un panel de reportes.

## 👥 Integrantes

| Nombre 
|--------|-----|
| Edgar Angulo Nolorbe
| Ximena Lozada Escobar


## 📌 Problema que resuelve

Muchas clínicas veterinarias pequeñas llevan el registro de sus pacientes, dueños y consultas en cuadernos u hojas de cálculo dispersas, lo que genera pérdida de información, duplicados y dificultad para saber cuánto se atendió o se facturó. **Ximedgar** centraliza esa información en un panel administrativo: permite registrar dueños y mascotas, llevar el historial de consultas con los servicios aplicados y obtener reportes de consultas e ingresos de forma inmediata.

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Vite, React Router, Lucide React |
| Backend | Java 25, Spring Boot 3.5.6 (Web, Data JPA, Validation), Lombok |
| Base de datos | PostgreSQL alojado en **Neon** |
| Despliegue backend | **Railway** |
| Despliegue frontend | **Vercel** |

## 🔗 Enlaces

- **Frontend (público):** https://vet-frontend-woad.vercel.app?_vercel_share=Og78FflI4ZEoqE6c4bgeTISFukDcxsR6
- **Backend (público):** veterinaria-production-7017.up.railway.app`
- **Repositorio:** https://github.com/Erephos/Vet

## ✅ Funcionalidades implementadas

- **Autenticación:** inicio de sesión y creación de cuentas con rol (Administrador / Veterinario); las rutas internas están protegidas y la sesión se mantiene en el navegador.
- **Inicio (dashboard):** saludo personalizado, consultas del día, total de mascotas y dueños, próximas citas, accesos rápidos y veterinarios activos.
- **Dueños:** registro, edición, eliminación y vista de detalle (nombre, teléfono, dirección).
- **Mascotas:** CRUD con dueño, raza y fecha de nacimiento, más detalle por mascota.
- **Consultas:** registro de consultas con mascota, veterinario, fecha y hora, diagnóstico y costo base, con detalle de la consulta.
- **Servicios:** catálogo de servicios con precio, asociables a cada consulta (con observaciones).
- **Veterinarios:** gestión de veterinarios con especialidad y teléfono.
- **Catálogos:** administración de especies y razas usadas al registrar mascotas.
- **Reportes:** consultas totales, ingresos totales (costo base + servicios), servicios aplicados, consultas por veterinario e ingresos por servicio.
- **Perfil:** datos de la cuenta activa y, para administradores, listado de cuentas registradas.
- **Diseño responsive:** menú lateral adaptable a pantallas de teléfono.
- **API REST** con endpoints CRUD bajo `/api/` para: `usuarios` (incluye `/login`), `duenos`, `mascotas`, `razas`, `especies`, `consultas`, `servicios`, `veterinarios` y `detalle-consulta-servicio`.

## 💻 Ejecución local

### Requisitos previos

- [JDK 25](https://jdk.java.net/25/) 
- [Maven](https://maven.apache.org/) 3.9+ 
- [Node.js](https://nodejs.org/) 18+ y npm
- [NEON] (postgresql://neondb_owner:npg_C4SzoBDgFAU8@ep-restless-thunder-aej0zbou-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Erephos/Vet.git
cd Vet
```

### 2. Backend (Spring Boot)

1. Crear en la base de datos las tablas del proyecto: `usuarios`, `veterinarios`, `duenos`, `especies`, `razas`, `mascotas`, `servicios`, `consultas` y `detalle_consulta_servicio`
2. Definir las variables de entorno que lee `application.properties`:

   | Variable | Descripción | Ejemplo |
   |----------|-------------|---------|
   | `DB_URL` | URL JDBC de PostgreSQL | `jdbc:postgresql://neondb_owner:npg_C4SzoBDgFAU8@ep-restless-thunder-aej0zbou-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require` |
   | `DB_USER` | Usuario de la base de datos | `neondb_owner` |
   | `DB_PASSWORD` | Contraseña de la base de datos | `npg_C4SzoBDgFAU8` |

   Linux / macOS:
   ```bash
   export DB_URL="jdbc:postgresql://<host>/<base>?sslmode=require"
   export DB_USER="<usuario>"
   export DB_PASSWORD="<contraseña>"
   ```
   Windows (PowerShell):
   ```powershell
   $env:DB_URL="jdbc:postgresql://<host>/<base>?sslmode=require"
   $env:DB_USER="<usuario>"
   $env:DB_PASSWORD="<contraseña>"
   ```
3. Ejecutar:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. El backend queda en **http://localhost:8080** (al iniciar imprime `CONEXION EXITOSA` si la base de datos responde). Prueba: `http://localhost:8080/api/especies`.

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
- **Backend:** Railway, con las variables `DB_URL`, `DB_USER` y `DB_PASSWORD` configuradas en el servicio.
- **Frontend:** Vercel, con la variable `VITE_API_URL` apuntando a la URL pública del backend; `vercel.json` redirige todas las rutas a `index.html` para que React Router funcione.
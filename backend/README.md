# Backend – Sistema Veterinaria (Spring Boot)

## Variables de entorno

No se guardan en el código ni en GitHub. En local van en IntelliJ (Edit Configurations → Environment variables)
y en producción en la pestaña *Variables* de Railway.

| Variable | Para qué sirve |
|---|---|
| `DB_URL` | URL JDBC de Neon, empieza con `jdbc:postgresql://` |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |
| `JWT_SECRET` | Clave con la que se firman los tokens. Mínimo 32 caracteres, aleatoria. Si falta, la app no arranca |
| `JWT_EXPIRATION_MINUTES` | Opcional. Duración del token (por defecto 480 = 8 horas) |

Para generar un `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`

## Seguridad

- **Contraseñas:** se guardan con BCrypt. Las cuentas antiguas en texto plano se convierten solas al arrancar
  (`MigracionPasswords`). La contraseña nunca se devuelve en las respuestas JSON.
- **Login:** `POST /api/usuarios/login` devuelve `{ token, usuario }`. El frontend envía el token en cada
  petición con `Authorization: Bearer <token>`.
- **Sin token válido** la API responde `401`. **Con token pero sin permiso**, `403`.
- Las reglas de acceso están todas juntas en `config/SecurityConfig.java`.

| Recurso | Administrador | Veterinario |
|---|---|---|
| `/api/usuarios` (listar, crear y eliminar cuentas) | Sí | No |
| servicios, razas, especies, veterinarios | Leer y modificar | Solo leer |
| dueños, mascotas, consultas, detalle de consulta | Todo | Todo |

El registro público de cuentas ya no existe: solo un administrador logueado crea y elimina cuentas
(Perfil → Crear cuenta / ícono de papelera). Reglas del borrado: no puedes eliminar tu propia cuenta
ni al último administrador (responde 409 con el motivo).

## Cuenta de emergencia (si no queda ningún administrador)

Insertar una fila en `usuarios` desde DBeaver con `rol = 'admin'` y la contraseña **en texto plano**,
luego reiniciar el backend: al arrancar la convierte a BCrypt.

## Validaciones y errores

- Los modelos (`model/`) llevan las reglas de cada campo con Bean Validation (`@NotBlank`, `@Size`, `@NotNull`,
  `@PositiveOrZero`, `@PastOrPresent`, `@Pattern` para teléfonos...). Los controladores las aplican con `@Valid`,
  así que un dato inválido responde `400` con el motivo en vez de fallar en la base de datos.
- Todos los errores salen con el mismo formato, gracias a `exception/ManejadorErrores.java`:

```json
{ "status": 400, "mensaje": "Hay datos inválidos: El nombre del dueño es obligatorio",
  "errores": { "nombre": "El nombre del dueño es obligatorio" } }
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos, JSON o fechas mal formados, parámetro de la dirección incorrecto |
| 401 | Falta el token o venció |
| 403 | El rol no tiene permiso |
| 404 | El registro no existe |
| 409 | El registro está en uso (por ejemplo, un dueño con mascotas), duplicado o conflicto de reglas |
| 500 | Error inesperado: el detalle técnico queda solo en el log del servidor, nunca se envía al cliente |

Para lanzar un error propio desde un controlador:
`throw new ResponseStatusException(HttpStatus.CONFLICT, "Motivo en español");`

## Reglas de borrado

Toda la lógica está en `services/EliminacionService.java`. Cada borrado es una sola transacción: si algo falla,
no se borra nada a medias. Se borra siempre de lo más dependiente a lo menos.

| Al eliminar... | Qué pasa |
|---|---|
| Dueño | Se eliminan también sus mascotas, sus consultas y los servicios aplicados |
| Mascota | Se eliminan también sus consultas y los servicios aplicados |
| Consulta | Se eliminan también sus servicios aplicados |
| Raza | **Bloqueado** (409) si hay mascotas que la usan |
| Especie | **Bloqueado** (409) si tiene razas |
| Servicio | **Bloqueado** (409) si ya se aplicó en alguna consulta |
| Veterinario | **Bloqueado** (409) si atendió consultas o tiene cuentas asociadas |
| Cuenta | No puedes eliminar la tuya ni al último administrador |

Antes de confirmar, el frontend consulta cuántos datos se eliminarán con
`GET /api/duenos/{id}/impacto`, `/api/mascotas/{id}/impacto` y `/api/consultas/{id}/impacto`
(responden `{ mascotas, consultas, serviciosAplicados }`).

Los catálogos no se borran en cascada a propósito: eliminar una raza arrastraría a todas las mascotas de esa raza.

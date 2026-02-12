# 📡 API REST Documentation - SINDESCOL

> **Desarrollador:** [Omar Santiago Salazar Yaqueno]  
> **Versión API:** 1.0.0  
> **Base URL:** `http://localhost:4000/api` (Development)  
> **Base URL:** `https://sindescol.up.railway.app/api` (Production)

---

## 🔐 Autenticación

Todas las rutas excepto `/auth/login` requieren un token JWT en el header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@presidencia.com"(solo pruebas),
  "password": "Admin123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id_usuario": 1,
    "email": "admin@presidencia.com",
    "nombre": "Administrador",
    "rol": "presidencia_nacional",
    "departamento": "Nacional"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

---

## 👥 Afiliados

### Listar Todos los Afiliados

```http
GET /api/afiliados
Authorization: Bearer <token>
```

**Query Parameters (Opcionales):**
- `departamento` - Filtrar por departamento
- `municipio` - Filtrar por municipio
- `cargo` - Filtrar por cargo
- `estado` - Filtrar por estado (activo/inactivo)

**Example:**
```http
GET /api/afiliados?departamento=Cundinamarca&estado=activo
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_afiliado": 1,
      "nombres": "Juan Carlos",
      "apellidos": "Pérez Gómez",
      "cedula": "1234567890",
      "departamento": "Cundinamarca",
      "municipio": "Bogotá",
      "cargo": "Profesor",
      "email": "juan.perez@example.com",
      "celular": "3001234567",
      "estado": "activo",
      "foto_url": "data:image/jpeg;base64,..."
    }
  ]
}
```

### Obtener Afiliado por ID

```http
GET /api/afiliados/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_afiliado": 1,
    "nombres": "Juan Carlos",
    "apellidos": "Pérez Gómez",
    ...
  }
}
```

### Buscar Afiliado por Cédula

```http
GET /api/afiliados/cedula/:cedula
Authorization: Bearer <token>
```

**Example:**
```http
GET /api/afiliados/cedula/1234567890
```

### Crear Afiliado

```http
POST /api/afiliados
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombres": "María",
  "apellidos": "González",
  "cedula": "9876543210",
  "fecha_nacimiento": "1990-05-15",
  "departamento": "Antioquia",
  "municipio": "Medellín",
  "direccion": "Calle 50 #20-30",
  "celular": "3109876543",
  "email": "maria.gonzalez@example.com",
  "id_cargo": 2,
  "fecha_ingreso_sindicato": "2023-01-10",
  "estado": "activo",
  "foto_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Afiliado creado exitosamente",
  "data": {
    "id_afiliado": 123,
    ...
  }
}
```

### Actualizar Afiliado

```http
PUT /api/afiliados/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "celular": "3209876543",
  "email": "nuevo.email@example.com",
  "estado": "activo"
}
```

### Eliminar Afiliado

```http
DELETE /api/afiliados/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Afiliado eliminado exitosamente"
}
```

### Carga Masiva de Afiliados

```http
POST /api/afiliados/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [archivo.csv]
```

---

## 💰 Cuotas

### Listar Todas las Cuotas

```http
GET /api/cuotas
Authorization: Bearer <token>
```

**Query Parameters:**
- `departamento` - Filtrar por departamento
- `mes` - Filtrar por mes (1-12)
- `año` - Filtrar por año (2024, 2025, etc.)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_cuota": 1,
      "id_afiliado": 5,
      "nombres": "Juan Pérez",
      "cedula": "1234567890",
      "valor": 50000,
      "fecha_pago": "2025-01-15",
      "mes": "Enero",
      "año": 2025
    }
  ]
}
```

### Obtener Cuotas por Afiliado

```http
GET /api/cuotas/afiliado/:id
Authorization: Bearer <token>
```

### Crear Cuota Individual

```http
POST /api/cuotas
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_afiliado": 5,
  "valor": 50000,
  "fecha_pago": "2025-02-10",
  "observaciones": "Pago mensual"
}
```

### Registro Masivo de Cuotas

```http
POST /api/cuotas/masivo
Authorization: Bearer <token>
Content-Type: application/json

{
  "cuotas": [
    {
      "id_afiliado": 5,
      "valor": 50000,
      "fecha_pago": "2025-02-10"
    },
    {
      "id_afiliado": 8,
      "valor": 45000,
      "fecha_pago": "2025-02-10"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "50 cuotas registradas exitosamente",
  "insertadas": 50
}
```

### Eliminar Cuota

```http
DELETE /api/cuotas/:id
Authorization: Bearer <token>
```

---

## 💵 Salarios

### Listar Todos los Salarios

```http
GET /api/salarios
Authorization: Bearer <token>
```

**Query Parameters:**
- `departamento` - Filtrar por departamento
- `cargo` - Filtrar por cargo

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_salario": 1,
      "nombre_cargo": "Profesor",
      "nombre_municipio": "Bogotá",
      "departamento": "Cundinamarca",
      "salario": 2500000
    }
  ]
}
```

### Obtener Salario por ID

```http
GET /api/salarios/:id
Authorization: Bearer <token>
```

### Crear Salario

```http
POST /api/salarios
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_cargo": 2,
  "id_municipio": 50,
  "salario": 2800000
}
```

### Actualizar Salario

```http
PUT /api/salarios/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "salario": 3000000
}
```

### Actualización Masiva por Departamento

```http
PUT /api/salarios-departamentos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "salario": 2900000,
  "aplicar_a_todos": true
}
```

---

## 🌎 Departamentos y Municipios

### Listar Departamentos

```http
GET /api/departamentos
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_departamento": 1,
      "nombre_departamento": "Cundinamarca",
      "total_municipios": 116
    }
  ]
}
```

### Crear Departamento

```http
POST /api/departamentos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre_departamento": "Santander"
}
```

### Listar Municipios

```http
GET /api/municipios
Authorization: Bearer <token>
```

**Query Parameters:**
- `departamento` - Filtrar por departamento

### Crear Municipio

```http
POST /api/municipios
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre_municipio": "Bucaramanga",
  "id_departamento": 5
}
```

---

## 🎯 Cargos

### Listar Cargos

```http
GET /api/cargos
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_cargo": 1,
      "nombre_cargo": "Profesor",
      "descripcion": "Docente de educación básica"
    }
  ]
}
```

### Crear Cargo

```http
POST /api/cargos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre_cargo": "Coordinador",
  "descripcion": "Coordinador académico"
}
```

---

## 👤 Usuarios

### Listar Usuarios

```http
GET /api/usuarios
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_usuario": 1,
      "email": "admin@presidencia.com",
      "nombre": "Admin Nacional",
      "rol": "presidencia_nacional",
      "departamento": "Nacional",
      "activo": true
    }
  ]
}
```

### Crear Usuario

```http
POST /api/usuarios
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "nuevo@presidencia.com",
  "password": "Password123!",
  "nombre": "Nuevo Usuario",
  "celular": "3001234567",
  "rol": "presidencia_departamental",
  "departamento": "Antioquia",
  "activo": true
}
```

### Actualizar Usuario

```http
PUT /api/usuarios/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Nombre Actualizado",
  "activo": false
}
```

---

## 💬 Mensajes del Día

### Listar Mensajes

```http
GET /api/mensajes-dia
Authorization: Bearer <token>
```

### Obtener Mensaje Aleatorio

```http
GET /api/mensajes-dia/aleatorio
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id_mensaje": 5,
    "mensaje": "Mantener datos de afiliados al día mejora el servicio.",
    "activo": true
  }
}
```

---

## 🆘 Soporte

### Enviar Solicitud de Soporte

```http
POST /api/support/solicitud
Authorization: Bearer <token>
Content-Type: application/json

{
  "asunto": "Error al cargar cuotas",
  "descripcion": "No puedo importar el archivo Excel de cuotas...",
  "prioridad": "alta"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Solicitud enviada exitosamente. Te contactaremos pronto."
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos o faltantes |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para esta acción |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: cédula duplicada) |
| 413 | Payload Too Large | Archivo demasiado grande |
| 500 | Internal Server Error | Error del servidor |

---

## 🔒 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| `presidencia_nacional` | Acceso total a todos los módulos y departamentos |
| `presidencia_departamental` | Acceso solo a su departamento asignado |
| `secretario_general` | Permisos extendidos según configuración |

---

## 📝 Ejemplos de Uso con cURL

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@presidencia.com", "password": "Admin123!"}'
```

### Listar Afiliados (con token)
```bash
curl -X GET http://localhost:4000/api/afiliados \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Crear Afiliado
```bash
curl -X POST http://localhost:4000/api/afiliados \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Pedro",
    "apellidos": "Ramírez",
    "cedula": "555666777",
    "departamento": "Valle",
    "municipio": "Cali",
    "id_cargo": 1
  }'
```

---

**Documentado por:** [Omar Santiago Salazar]  
**Última actualización:** Febrero 2026  
**¿Encontraste un error?** Reporta en: [tossy2607@gmail.com]

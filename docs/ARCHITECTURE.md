# 🏗 Arquitectura del Sistema SINDESCOL

> **Autor:** Omar Santiago Salazar  
> **Fecha:** Febrero 2026  
> **Versión:** 1.0.0

---

## Tabla de Contenidos
- [Visión General](#visión-general)
- [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
- [Arquitectura Backend](#arquitectura-backend)
- [Arquitectura Frontend](#arquitectura-frontend)
- [Base de Datos](#base-de-datos)
- [Seguridad](#seguridad)
- [Flujos de Datos](#flujos-de-datos)
- [Decisiones de Diseño](#decisiones-de-diseño)

---

## Visión General

SINDESCOL está construido siguiendo principios de **arquitectura limpia** y **separación de responsabilidades**. El sistema utiliza un patrón **MVC modificado** con capas bien definidas.

### Principios Aplicados
- ✅ **Separation of Concerns**: Cada módulo tiene una responsabilidad única
- ✅ **DRY (Don't Repeat Yourself)**: Código reutilizable en utils y services
- ✅ **Single Responsibility**: Controllers, Services y Routes separados
- ✅ **RESTful API**: Endpoints siguiendo convenciones REST
- ✅ **JWT Stateless Auth**: Autenticación sin sesiones de servidor
- ✅ **Component-Based UI**: Frontend modular con React

---

## Arquitectura de Alto Nivel

```
┌───────────────────────────────────────────────────────────────┐
│                          USUARIO                              │
└───────────────────────┬───────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
┌────────▼────────┐          ┌────────▼────────┐
│   NAVEGADOR     │          │    POSTMAN      │
│   (Chrome/Edge) │          │   (Testing)     │
└────────┬────────┘          └────────┬────────┘
         │                            │
         └──────────────┬─────────────┘
                        │
              HTTP/HTTPS Requests
                        │
         ┌──────────────▼──────────────┐
         │     RAILWAY HOSTING         │
         │  ┌──────────┐ ┌──────────┐ │
         │  │ Frontend │ │ Backend  │ │
         │  │  (Vite)  │ │ (Express)│ │
         │  └──────────┘ └─────┬────┘ │
         │                     │      │
         │              ┌──────▼────┐ │
         │              │   MySQL   │ │
         │              │  Database │ │
         │              └───────────┘ │
         └─────────────────────────────┘
```

---

## Arquitectura Backend

### Estructura de Capas

```
┌─────────────────────────────────────────────────────┐
│                    ROUTES LAYER                     │
│  Define endpoints y métodos HTTP                    │
│  Valida parámetros de entrada                       │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│                 MIDDLEWARE LAYER                    │
│  - Autenticación JWT                                │
│  - Validación de roles                              │
│  - Error handling                                   │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│                CONTROLLERS LAYER                    │
│  Maneja request/response                            │
│  Valida datos de entrada                            │
│  Llama a services                                   │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│                  SERVICES LAYER                     │
│  Lógica de negocio                                  │
│  Transacciones complejas                            │
│  Validaciones de negocio                            │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│                   DATABASE LAYER                    │
│  MySQL queries                                      │
│  Pool de conexiones                                 │
│  Transacciones DB                                   │
└─────────────────────────────────────────────────────┘
```

### Flujo de una Petición

```javascript
// 1. ROUTE - Define el endpoint
router.get('/afiliados', authMiddleware, afiliadsController.getAllAfiliados);

// 2. MIDDLEWARE - Valida JWT
authMiddleware(req, res, next) {
  // Verifica token
  // Decodifica usuario
  // Adjunta req.user
  next();
}

// 3. CONTROLLER - Maneja request
async getAllAfiliados(req, res) {
  const filters = req.query;
  const afiliados = await afiliadsService.getAll(filters);
  res.json({ success: true, data: afiliados });
}

// 4. SERVICE - Lógica de negocio
async getAll(filters) {
  let query = 'SELECT * FROM afiliados WHERE 1=1';
  // Aplica filtros
  // Ejecuta query
  return results;
}

// 5. DATABASE - Ejecuta query
const [results] = await db.query(query, params);
```

### Módulos Principales

#### 1. Authentication Module
```
authRoutes → authController → authService
  ├─ login()
  └─ middleware/auth.js (JWT validation)
```

#### 2. Afiliados Module
```
afiliadsRoutes → afiliadsController → afiliadsService
  ├─ getAll()
  ├─ getById()
  ├─ getByCedula()
  ├─ create()
  ├─ update()
  ├─ delete()
  └─ uploadMasivo()
```

#### 3. Cuotas Module
```
cuotasRoutes → cuotasController → cuotasService
  ├─ getAll()
  ├─ getByAfiliado()
  ├─ create()
  ├─ createMasivo()
  └─ delete()
```

#### 4. Salarios Module
```
salariosRoutes → salariosController → salariosService
  ├─ getAll()
  ├─ getById()
  ├─ create()
  ├─ update()
  └─ updateMasivo()
```

---

## Arquitectura Frontend

### Estructura Component-Based

```
App.jsx
├── Routes (React Router)
│   ├── /home → Home.jsx
│   ├── /afiliados → Afiliados.jsx
│   ├── /cuotas → Cuotas.jsx
│   └── ...
│
└── Layout Components
    ├── Navbar.jsx
    └── Sidebar.jsx

Cada Page:
  ├── State Management (useState)
  ├── API Calls (useEffect)
  ├── Render (JSX)
  └── Child Components
      ├── Modals
      ├── Forms
      └── Tables
```

### Patrón de Componentes

```javascript
// SMART COMPONENT (Page)
function Afiliados() {
  const [afiliados, setAfiliados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lógica de datos
  useEffect(() => {
    fetchAfiliados();
  }, []);
  
  // Render con componentes dummy
  return (
    <div>
      <FiltersBar onFilter={handleFilter} />
      <AfiliadsTable data={afiliados} />
      <ModalCrear onSave={handleCreate} />
    </div>
  );
}

// DUMMY COMPONENT (Component)
function AfiliadsTable({ data }) {
  return (
    <table>
      {data.map(afiliado => (
        <tr key={afiliado.id}>...</tr>
      ))}
    </table>
  );
}
```

### Estado y Gestión de Datos

```
localStorage
  └─ token (JWT)

React State (useState)
  ├─ datos (arrays/objects)
  ├─ loading (booleans)
  ├─ modals (open/close)
  └─ filters (criterios búsqueda)

API Service (axios)
  └─ api.js
      ├─ interceptors (token injection)
      └─ error handling
```

---

## Base de Datos

### Modelo Entidad-Relación

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  USUARIOS   │       │  AFILIADOS   │       │   CARGOS    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id_usuario  │       │ id_afiliado  │───┐   │ id_cargo    │
│ email       │       │ id_cargo     │───┼──>│ nombre_cargo│
│ password    │       │ nombres      │   │   │ descripcion │
│ rol         │       │ apellidos    │   │   └─────────────┘
│ departamento│       │ cedula       │   │
└─────────────┘       │ departamento │   │   ┌──────────────┐
                      │ municipio    │   │   │ DEPARTAMENTOS│
                      │ ...          │   │   ├──────────────┤
                      └──────────────┘   │   │id_departamento│
                             │           └──>│ nombre_depto  │
                             │               └────────┬───────┘
                             │                        │
                      ┌──────▼──────┐                 │
                      │   CUOTAS    │        ┌────────▼──────┐
                      ├─────────────┤        │ MUNICIPIOS    │
                      │ id_cuota    │        ├───────────────┤
                      │ id_afiliado │        │ id_municipio  │
                      │ valor       │        │ id_departamento│
                      │ fecha_pago  │        │ nombre_muni   │
                      └─────────────┘        └───────────────┘
                                                     │
┌──────────────────┐                                │
│ SALARIOS_        │<───────────────────────────────┘
│ MUNICIPIOS       │
├──────────────────┤
│ id_salario       │
│ id_cargo         │
│ id_municipio     │
│ salario          │
└──────────────────┘
```

### Relaciones Clave

1. **Afiliados ↔ Cargos**: Many-to-One (Un afiliado tiene un cargo)
2. **Afiliados ↔ Cuotas**: One-to-Many (Un afiliado tiene muchas cuotas)
3. **Municipios ↔ Departamentos**: Many-to-One
4. **Salarios ↔ Cargos ↔ Municipios**: Tabla intermedia con valores

---

## Seguridad

### 1. Autenticación JWT

```javascript
Login Flow:
1. Usuario envía { email, password }
2. Backend valida credenciales (bcrypt compare)
3. Backend genera JWT con: { userId, rol, departamento }
4. Frontend guarda token en localStorage
5. Cada request incluye: Authorization: Bearer <token>
6. Middleware valida token y extrae usuario
```

### 2. Autorización por Roles

```javascript
Roles Jerárquicos:
- presidencia_nacional     // Acceso total
- presidencia_departamental // Solo su departamento
- secretario_general       // Permisos extendidos
```

### 3. Validaciones

**Backend:**
- Validación de entrada en controllers
- Sanitización de queries SQL (parameterized queries)
- Límite de tamaño de payload (50MB)
- Validación de tipos de datos

**Frontend:**
- Validación de formularios
- Sanitización de inputs
- Manejo de errores HTTP

### 4. Encriptación

- Contraseñas: `bcryptjs` (salt rounds: 10)
- Tokens: JWT firmado con secret key
- HTTPS en producción (Railway)

---

## Flujos de Datos

### Flujo: Crear Afiliado

```
[Usuario]
   │
   ├─> Completa formulario en ModalCrear.jsx
   │
   ├─> Frontend valida campos
   │
   ├─> POST /api/afiliados + JWT token
   │   Body: { nombres, apellidos, cedula, ... }
   │
[Backend]
   │
   ├─> authMiddleware valida token
   │
   ├─> afiliadsController.create()
   │   ├─> Valida datos requeridos
   │   └─> Llama afiliadsService.create()
   │
   ├─> afiliadsService.create()
   │   ├─> Verifica que cédula no exista
   │   ├─> INSERT INTO afiliados
   │   └─> Retorna afiliado creado
   │
   ├─> Response: { success: true, data: {...} }
   │
[Frontend]
   │
   ├─> Recibe respuesta
   ├─> Actualiza lista de afiliados
   ├─> Cierra modal
   └─> Muestra mensaje de éxito
```

### Flujo: Carga Masiva de Cuotas

```
[Usuario]
   │
   ├─> Selecciona archivo Excel/CSV
   │
├──> procesadorArchivos.js
│   ├─> Lee archivo (FileReader API)
│   ├─> Parsea con XLSX o CSV
│   ├─> Extrae { cedula, valor }
│   └─> Valida formato
│
├──> Para cada cédula:
│   └─> GET /api/afiliados/cedula/:cedula
│       └─> Obtiene info del afiliado
│
├──> Usuario revisa y confirma datos
│
├──> POST /api/cuotas/masivo
│   Body: [{ id_afiliado, valor, fecha_pago }, ...]
│
[Backend]
   │
   ├─> cuotasService.createMasivo()
   │   ├─> Inicia transacción SQL
   │   ├─> INSERT múltiple en tabla cuotas
   │   ├─> Commit si todo ok
   │   └─> Rollback si hay error
   │
   └─> Response: { success: true, insertadas: X }
```

---

## Decisiones de Diseño

### ¿Por qué Express y no NestJS?
- ✅ **Simplicidad**: Menos overhead, más control
- ✅ **Rendimiento**: Más ligero para proyectos medianos
- ✅ **Ecosistema**: Amplia documentación y ejemplos
- ✅ **Flexibilidad**: No impone estructura rígida

### ¿Por qué React y no Vue/Angular?
- ✅ **Comunidad**: Mayor soporte y recursos
- ✅ **Componentes**: Reutilización óptima
- ✅ **Flexibilidad**: Sin opiniones fuertes sobre estado
- ✅ **Experiencia previa**: Familiaridad del desarrollador

### ¿Por qué MySQL y no MongoDB?
- ✅ **Relaciones**: Datos altamente relacionales (afiliados, cuotas, salarios)
- ✅ **ACID**: Transacciones críticas para cuotas
- ✅ **Integridad**: Foreign keys y constraints
- ✅ **Reportes**: JOINs complejos para estadísticas

### ¿Por qué JWT y no Sessions?
- ✅ **Stateless**: No requiere almacenamiento en servidor
- ✅ **Escalabilidad**: Fácil de escalar horizontalmente
- ✅ **Mobile-ready**: Preparado para futuras apps móviles
- ✅ **Descentralizado**: Token contiene toda la info necesaria

### ¿Por qué Vite y no Create React App?
- ✅ **Velocidad**: Build ultrarrápido con ESM
- ✅ **HMR**: Hot Module Replacement instantáneo
- ✅ **Modernidad**: Herramienta más actualizada
- ✅ **Tamaño**: Bundles más pequeños

---

## Mejoras Futuras

### Corto Plazo
- [ ] Tests unitarios (Jest + React Testing Library)
- [ ] Logs estructurados (Winston/Pino)
- [ ] Cache con Redis para queries frecuentes
- [ ] Paginación en listados grandes

### Mediano Plazo
- [ ] WebSockets para notificaciones en tiempo real
- [ ] GraphQL API como alternativa a REST
- [ ] PWA (Progressive Web App)
- [ ] Exportación de reportes PDF

### Largo Plazo
- [ ] Aplicación móvil (React Native)
- [ ] Microservicios (separar módulos grandes)
- [ ] Machine Learning para predicción de cuotas
- [ ] Dashboard analytics avanzado

---

**Documentado por:** Omar Santiago Salazar  
**Última actualización:** Febrero 2026  
**Versión del sistema:** 1.0.0

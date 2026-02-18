# 🏛️ SINDESCOL - Sistema de Gestión Sindical

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)

> **Sistema integral de gestión para sindicatos colombianos**  
> Desarrollado por: **Omar Santiago Salazar**  
> Fecha de desarrollo: 2025-2026  
> 📧 Contacto: ossy2607@gmail.com

---

## 📋 Tabla de Contenidos
- [Descripción](#-descripción)
- [Características](#-características-principales)
- [Tecnologías](#-tecnologías-utilizadas)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Documentation](#-api-documentation)
- [Despliegue](#-despliegue)
- [Contribuciones](#-contribuciones)
- [Licencia](#-licencia)
- [Autor](#-autor)

---

## 📖 Descripción

SINDESCOL es un sistema web completo diseñado para la gestión integral de sindicatos en Colombia. Permite administrar afiliados, controlar cuotas sindicales, gestionar salarios por departamento, administrar usuarios con diferentes roles jerárquicos y mantener una comunicación efectiva entre las diferentes presidencias departamentales.

### Problema que resuelve
El sistema digitaliza y centraliza la gestión sindical, eliminando procesos manuales propensos a errores y facilitando:
- Control preciso de afiliados y sus datos
- Gestión automatizada de cuotas (importación masiva desde Excel/CSV)
- Transparencia en salarios por cargo y departamento
- Comunicación directa entre presidencias
- Auditoría y trazabilidad de operaciones

---

## ✨ Características Principales

### 👥 Gestión de Afiliados
- ✅ Registro completo con datos personales y laborales
- ✅ Carga masiva mediante archivos Excel/CSV
- ✅ Fotografía del afiliado (Base64)
- ✅ Historial de cuotas y pagos
- ✅ Filtros avanzados por departamento, municipio, cargo
- ✅ Actualización de información completa

### 💰 Sistema de Cuotas
- ✅ Importación masiva desde Excel/CSV/TXT
- ✅ Validación automática de cédulas
- ✅ Registro individual de pagos
- ✅ Historial completo por afiliado
- ✅ Reportes de cuotas pendientes

### 📊 Gestión de Salarios
- ✅ Salarios por cargo y departamento
- ✅ Actualización masiva y por municipio
- ✅ Comparativas entre departamentos
- ✅ Exportación de datos

### 🔐 Sistema de Usuarios y Roles
- ✅ **Presidencia Nacional**: Acceso total
- ✅ **Presidencia Departamental**: Gestión departamental
- ✅ **Secretario General**: Permisos extendidos
- ✅ Autenticación JWT segura
- ✅ Tokens con expiración configurable

### 🌐 Gestión Territorial
- ✅ Administración de departamentos
- ✅ Gestión de municipios por departamento
- ✅ Relaciones jerárquicas territorio-afiliado

### 💬 Sistema de Soporte
- ✅ Solicitudes de soporte con prioridad
- ✅ Notificaciones por email a Presidencia Nacional
- ✅ Sistema de mensajes del día

### 📈 Dashboard y Reportes
- ✅ Estadísticas en tiempo real
- ✅ Métricas de afiliados, cuotas, departamentos
- ✅ Gráficos interactivos
- ✅ Mensajes informativos rotativos

---

## 🛠 Tecnologías Utilizadas

### Backend
```javascript
Node.js v18+          // Runtime
Express.js v5         // Framework web
MySQL2 v3            // Base de datos
JWT                  // Autenticación
bcryptjs             // Encriptación de contraseñas
Nodemailer           // Envío de emails
Multer               // Carga de archivos
csv-parse            // Procesamiento CSV
```

### Frontend
```javascript
React 18.2           // Framework UI
React Router v6      // Navegación
Vite 4.4            // Build tool
Axios               // Cliente HTTP
XLSX (CDN)          // Procesamiento Excel
CSS3                // Estilos personalizados
```

### DevOps & Deployment
```bash
Railway             # Hosting y base de datos
Git/GitHub          # Control de versiones
dotenv              # Variables de entorno
```

---

## 🏗 Arquitectura

### Patrón de Diseño: MVC (Model-View-Controller)

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │   Pages    │  │ Components │  │  Services (API) │  │
│  └────────────┘  └────────────┘  └─────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
                         │ (JWT Auth)
┌────────────────────────┴────────────────────────────────┐
│                    BACKEND (Express)                    │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Routes   │→ │ Controllers  │→ │    Services    │ │
│  └────────────┘  └──────────────┘  └────────────────┘ │
│         │              │                    │           │
│  ┌──────┴──────┐      │         ┌──────────┴─────┐    │
│  │ Middleware  │      │         │  Utils/Helpers │    │
│  │   (Auth)    │      │         └────────────────┘    │
│  └─────────────┘      │                                │
└────────────────────────┼────────────────────────────────┘
                         │
                    ┌────┴─────┐
                    │  MySQL   │
                    │ Database │
                    └──────────┘
```

### Flujo de Datos
1. **Usuario** → Interfaz React (Frontend)
2. **Frontend** → Petición HTTP con JWT → Backend API
3. **Backend** → Middleware de autenticación valida token
4. **Controller** → Procesa la petición
5. **Service** → Lógica de negocio y consultas DB
6. **Database** → Retorna datos
7. **Backend** → Response JSON → Frontend
8. **Frontend** → Actualiza UI

---

## 🚀 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0
- Git

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sindescol.git
cd sindescol
```

### 2️⃣ Instalar dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

---

## ⚙️ Configuración

### Backend - Variables de Entorno

Crear archivo `backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sindescol
DB_PORT=3306

# JWT Configuration
JWT_SECRET=tu_clave_secreta_super_segura_2025
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=4000
NODE_ENV=development

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=SINDESCOL Sistema <tu-email@gmail.com>
```

### Frontend - Variables de Entorno

Crear archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

### Base de Datos

El sistema creará automáticamente las tablas necesarias en el primer arranque. Estructura principal:

- `usuarios` - Usuarios del sistema
- `afiliados` - Afiliados al sindicato
- `cargos` - Cargos laborales
- `departamentos` - Departamentos de Colombia
- `municipios` - Municipios por departamento
- `cuotas` - Cuotas sindicales
- `salarios_municipios` - Salarios por cargo/municipio
- `mensajes_dia` - Mensajes informativos
- Y más... (ver documentación completa en `/docs/DATABASE.md`)

---

## 💻 Uso

### Desarrollo Local

#### Backend
```bash
cd backend
npm run dev   # con nodemon (recomendado)
# o
node server.js
```
Servidor corriendo en: `http://localhost:4000`

#### Frontend
```bash
cd frontend
npm run dev
```
Aplicación corriendo en: `http://localhost:5173`

### Producción

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview  # para probar build
```

### Credenciales por Defecto

Para desarrollo, crear usuario admin:
```bash
cd backend
node scripts/createAdmin.js  # Si existe script
```

Credenciales sugeridas:
- **Email:** `admin@presidencia.com`
- **Password:** `Admin123!`
- **Rol:** `presidencia_nacional`

---

## 📁 Estructura del Proyecto

```
sindescol/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Configuración MySQL
│   │   ├── controllers/           # Controladores (lógica de rutas)
│   │   │   ├── authController.js
│   │   │   ├── afiliadsController.js
│   │   │   ├── cuotasController.js
│   │   │   ├── salariosController.js
│   │   │   ├── departamentosController.js
│   │   │   └── ...
│   │   ├── services/              # Lógica de negocio
│   │   │   ├── authService.js
│   │   │   ├── afiliadsService.js
│   │   │   ├── cuotasService.js
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   └── auth.js            # Middleware JWT
│   │   ├── routes/                # Definición de rutas
│   │   │   ├── index.js           # Router principal
│   │   │   ├── authRoutes.js
│   │   │   ├── afiliadsRoutes.js
│   │   │   └── ...
│   │   ├── utils/                 # Utilidades
│   │   │   ├── fetchWithAuth.js
│   │   │   ├── generateHash.js
│   │   │   └── uploadCsv.js
│   │   └── app.js                 # Configuración Express
│   ├── server.js                  # Punto de entrada
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── afiliados/
│   │   │   ├── cuotas/
│   │   │   ├── departamentos/
│   │   │   └── shared/
│   │   ├── pages/               # Páginas principales
│   │   │   ├── Home.jsx
│   │   │   ├── Afiliados.jsx
│   │   │   ├── Cuotas.jsx
│   │   │   ├── Departamentos.jsx
│   │   │   ├── GestionUsuarios.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js          # Cliente Axios
│   │   ├── utils/
│   │   │   └── procesadorArchivos.js
│   │   ├── styles/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
├── docs/                        # Documentación adicional
│   ├── API.md                   # Documentación API REST
│   ├── DATABASE.md              # Esquema de base de datos
│   └── ARCHITECTURE.md          # Arquitectura detallada
│
├── README.md                    # Este archivo
├── LICENSE                      # Licencia del proyecto
├── TODO.md                      # Tareas pendientes
└── VALORACION_PROYECTO.md      # Valoración económica
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Autenticación
Todas las rutas (excepto `/auth/login`) requieren token JWT en el header:
```
Authorization: Bearer <token>
```

### Endpoints Principales

#### 🔐 Autenticación
```http
POST /auth/login
Body: { email, password }
Response: { success, token, user }
```

#### 👤 Afiliados
```http
GET    /afiliados              # Listar todos
GET    /afiliados/:id          # Obtener uno
GET    /afiliados/cedula/:cedula  # Buscar por cédula
POST   /afiliados              # Crear
PUT    /afiliados/:id          # Actualizar
DELETE /afiliados/:id          # Eliminar
POST   /afiliados/upload       # Carga masiva CSV
```

#### 💵 Cuotas
```http
GET    /cuotas                 # Listar todas
GET    /cuotas/afiliado/:id   # Por afiliado
POST   /cuotas                 # Registrar individual
POST   /cuotas/masivo          # Carga masiva
DELETE /cuotas/:id             # Eliminar
```

#### 💰 Salarios
```http
GET    /salarios               # Listar todos
GET    /salarios/:id           # Obtener uno
POST   /salarios               # Crear
PUT    /salarios/:id           # Actualizar
```

Para documentación completa ver: [`docs/API.md`](docs/API.md)

---

## 🌐 Despliegue

### Railway (Recomendado)

1. **Crear proyecto en Railway**
2. **Conectar repositorio GitHub**
3. **Configurar variables de entorno**
4. **Deploy automático**

Documentación detallada: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

### Costos Estimados
- Plan Hobby: ~$5 USD/mes
- Plan Pro (100+ usuarios): ~$20 USD/mes

Ver análisis completo en [`VALORACION_PROYECTO.md`](VALORACION_PROYECTO.md)

---

## 🤝 Contribuciones

Este es un proyecto Empresarial desarrollado por **[Omar Santiago Salazar]**. 

Si deseas reportar bugs o sugerir mejoras:
1. Abre un issue en GitHub
2. Describe detalladamente el problema o sugerencia
3. Incluye capturas si es necesario

---

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para más detalles.

Copyright (c) 2025-2026 **[Omar Santiago Salazar]**

---

## 👨‍💻 Autor

**[Omar Santiago Salazar]**
- 📧 Email: [ossy2607@gmail.com]
- 🐙 GitHub: [OmarSsalazar](https://github.com/OmarSsalazar)

### 📅 Historial de Desarrollo
- **Enero 2025**: Inicio del proyecto
- **Febrero 2025**: Implementación completa backend
- **Marzo 2025**: Frontend y deployment
- **Febrero 2026**: Versión 1.0.0 estable

---

## 🙏 Agradecimientos

Desarrollado completamente desde cero con dedicación y esfuerzo personal.

Tecnologías utilizadas con gratitud a la comunidad open source:
- React Team
- Express.js Team
- MySQL Team
- Y toda la comunidad de desarrolladores

---

## 📞 Soporte

¿Necesitas ayuda? Contacta al desarrollador:
- 📧 Email: [ossy2607@gmail.com]
- 💬 Issues: [GitHub](https://github.com/OmarSsalazar)

---

<div align="center">

**Hecho con ❤️ por [Omar Santiago Salazar]**

⭐ Si te gusta este proyecto, dale una estrella en GitHub

</div>

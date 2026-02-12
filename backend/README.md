# 🖥️ SINDESCOL Backend

> **Desarrollador:** [Omar Santiago Salazar Yaqueno]  
> **Framework:** Express.js 5.1  
> **Node Version:** >= 18.0.0  
> **Database:** MySQL 8.0+

---

## 📖 Descripción

Backend REST API para el sistema de gestión sindical SINDESCOL. Implementa autenticación JWT, gestión de afiliados, cuotas, salarios y administración completa del sistema con arquitectura en capas (Routes → Controllers → Services → Database).

---

## 🏗️ Arquitectura

```
src/
├── config/
│   └── db.js              # Configuración pool MySQL
├── controllers/           # Lógica de manejo de requests
│   ├── authController.js
│   ├── afiliadsController.js
│   ├── cuotasController.js
│   └── ...
├── services/             # Lógica de negocio
│   ├── authService.js
│   ├── afiliadsService.js
│   └── ...
├── middleware/
│   └── auth.js           # Validación JWT
├── routes/               # Definición endpoints
│   ├── index.js
│   ├── authRoutes.js
│   └── ...
├── utils/                # Utilidades
│   ├── fetchWithAuth.js
│   └── ...
└── app.js                # Configuración Express
```

---

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sindescol
DB_PORT=3306

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Server
PORT=4000
NODE_ENV=development

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=SINDESCOL Sistema <tu-email@gmail.com>
```

### 3. Crear base de datos

```bash
mysql -u root -p
```

```sql
CREATE DATABASE sindescol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Las tablas se crearán automáticamente en el primer arranque.

---

## 💻 Uso

### Desarrollo

```bash
node server.js
```

Servidor corriendo en: `http://localhost:4000`

### Producción

```bash
NODE_ENV=production node server.js
```

---

## 📦 Dependencias Principales

```json
{
  "bcryptjs": "^3.0.3",        // Encriptación contraseñas
  "cors": "^2.8.5",            // CORS habilitado
  "dotenv": "^17.2.3",         // Variables de entorno
  "express": "^5.1.0",         // Framework web
  "jsonwebtoken": "^9.0.3",    // Autenticación JWT
  "mysql2": "^3.15.3",         // Driver MySQL
  "nodemailer": "^8.0.1",      // Envío de emails
  "multer": "^2.0.2",          // Upload archivos
  "csv-parse": "^6.1.0"        // Procesamiento CSV
}
```

---

## 🔐 Autenticación

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@presidencia.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### Protección de Rutas

Todas las rutas (excepto login) requieren token JWT:

```javascript
// middleware/auth.js
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Validación...
};
```

---

## 📡 API Endpoints

Ver documentación completa en: [`/docs/API.md`](../docs/API.md)

**Principales módulos:**
- `/api/auth` - Autenticación
- `/api/afiliados` - Gestión de afiliados
- `/api/cuotas` - Gestión de cuotas
- `/api/salarios` - Gestión de salarios
- `/api/departamentos` - Departamentos
- `/api/municipios` - Municipios
- `/api/cargos` - Cargos
- `/api/usuarios` - Usuarios del sistema
- `/api/mensajes-dia` - Mensajes informativos
- `/api/support` - Soporte técnico

---

## 🗄️ Base de Datos

### Pool de Conexiones

```javascript
// config/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Esquema Completo

Ver: [`/docs/DATABASE.md`](../docs/DATABASE.md)

---

## 🛡️ Seguridad

### Medidas Implementadas

✅ **Contraseñas hasheadas** con bcrypt (10 salt rounds)  
✅ **JWT tokens** con expiración configurable  
✅ **Queries parametrizadas** (prevención SQL injection)  
✅ **CORS configurado** para dominios específicos  
✅ **Validación de entrada** en todos los controllers  
✅ **Roles y permisos** por tipo de usuario  
✅ **Rate limiting** (recomendado para producción)

---

## 📂 Estructura de Servicios

### Ejemplo: afiliadsService.js

```javascript
/**
 * Service: Afiliados
 * Author: Omar Santiago Salazar
 * Description: Lógica de negocio para gestión de afiliados
 */

class AfiliadsService {
  async getAll(filters) {
    // Lógica de consulta con filtros
  }
  
  async create(afiliadoData) {
    // Validaciones + INSERT
  }
  
  async update(id, data) {
    // Validaciones + UPDATE
  }
  
  async delete(id) {
    // DELETE con validaciones
  }
}
```

---

## 🧪 Testing

### Manual con cURL

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@presidencia.com","password":"Admin123!"}'

# Get afiliados
curl -X GET http://localhost:4000/api/afiliados \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Testing con Postman

Importar colección desde: `/docs/postman/` (si existe)

---

## 🐛 Debugging

### Logs

```javascript
// Activar logs detallados
console.log('📥 Request:', req.body);
console.log('✅ Response:', data);
console.error('❌ Error:', error);
```

### Common Issues

**Error: connect ECONNREFUSED**
- ✅ Verificar que MySQL esté corriendo
- ✅ Validar credenciales en `.env`

**Error: JWT malformed**
- ✅ Verificar formato del token en header
- ✅ Asegurar formato: `Bearer <token>`

**Error: ER_DUP_ENTRY**
- ✅ Cédula o email duplicado
- ✅ Validar unicidad antes de INSERT

---

## 🌐 Deployment

### Railway (Recomendado)

1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático
4. Configurar MySQL addon

Ver guía completa: [`/docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md)

---

## 📝 Scripts Disponibles

```bash
# Ejecutar servidor
node server.js

# Con nodemon (desarrollo)
nodemon server.js

# Crear usuario admin (si existe script)
node scripts/createAdmin.js
```

---

## ✅ Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en producción
- [ ] JWT_SECRET diferente al de desarrollo
- [ ] Base de datos creada y migrada
- [ ] CORS configurado para dominio de producción
- [ ] EMAIL configurado con credenciales válidas
- [ ] Logs configurados (Winston/Pino)
- [ ] Backup automatizado configurado

---

## 🤝 Contribuciones

Este proyecto fue desarrollado por **[Omar Santiago Salazar]**. 

Para reportar bugs o sugerir mejoras, contactar a: [ossy2607@gmail.com]

---

## 📄 Licencia

MIT License - Ver [LICENSE](../LICENSE)

---

## 👨‍💻 Autor

**[Omar Santiago Salazar]**  
📧 [ossy2607@gmail.com]   
🐙 [GitHub](https://github.com/OmarSsalazar)

---

**Desarrollado con ❤️ en Node.js + Express**

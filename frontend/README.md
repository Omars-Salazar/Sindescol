# ⚛️ SINDESCOL Frontend

> **Desarrollador:** [Omar Santiago Salazar]  
> **Framework:** React 18.2  
> **Build Tool:** Vite 4.4  
> **Node Version:** >= 18.0.0

---

## 📖 Descripción

Interfaz de usuario moderna y responsiva para el sistema de gestión sindical SINDESCOL. Construida con React y Vite, implementa comunicación con API REST, gestión de estados, autenticación JWT y componentes reutilizables.

---

## 🎨 Características UI

✅ **Dashboard interactivo** con estadísticas en tiempo real  
✅ **Gestión de afiliados** con búsqueda y filtros avanzados  
✅ **Sistema de cuotas** con importación masiva Excel/CSV  
✅ **Gestión territorial** (departamentos y municipios)  
✅ **Administración de usuarios** con roles  
✅ **Interfaz responsiva** (Desktop/Tablet/Mobile)  
✅ **Modales dinámicos** para CRUD operations  
✅ **Sistema de notificaciones** en tiempo real  

---

## 🏗️ Arquitectura

```
src/
├── components/           # Componentes reutilizables
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── afiliados/
│   │   ├── ModalCrear.jsx
│   │   ├── ModalEditar.jsx
│   │   └── ModalVer.jsx
│   ├── cuotas/
│   │   ├── ModalRegistrarCuota.jsx
│   │   └── ModalCuotasMasivas.jsx
│   ├── departamentos/
│   │   ├── ModalCrearDepartamento.jsx
│   │   └── ModalEditarMunicipio.jsx
│   └── shared/
│       └── ...
├── pages/               # Páginas principales
│   ├── Home.jsx
│   ├── Afiliados.jsx
│   ├── Cuotas.jsx
│   ├── Departamentos.jsx
│   ├── Cargos.jsx
│   ├── GestionUsuarios.jsx
│   └── ...
├── services/
│   └── api.js          # Cliente Axios configurado
├── utils/
│   └── procesadorArchivos.js  # Procesamiento Excel/CSV
├── styles/
│   └── *.css
├── App.jsx             # Router y layout principal
├── main.jsx            # Entry point
└── index.css           # Estilos globales
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
VITE_API_URL=http://localhost:4000/api

# Webhook externo para contingencia (independiente)
VITE_SUPPORT_FALLBACK_WEBHOOK_URL=

# Token compartido opcional para proteger el webhook (header x-support-token)
VITE_SUPPORT_FALLBACK_TOKEN=

# Correo de emergencia usado en fallback final (mailto)
VITE_SUPPORT_EMERGENCY_EMAIL=soportesindescol@gmail.com
```

Para producción:
```env
VITE_API_URL=https://tu-backend.railway.app/api
```

---

## 💻 Uso

### Desarrollo

```bash
npm run dev
```

Abre: `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

Output en: `dist/`

### Preview del Build

```bash
npm run preview
```

---

## 📦 Dependencias

```json
{
  "react": "^18.2.0",              // Framework UI
  "react-dom": "^18.2.0",          // React DOM renderer
  "react-router-dom": "^6.15.0",  // Routing
  "axios": "^1.5.0"                // HTTP client
}
```

### Dev Dependencies

```json
{
  "@vitejs/plugin-react": "^4.0.0",  // Vite plugin React
  "vite": "^4.4.0"                    // Build tool
}
```

### CDN Dependencies (dinamico)

- **XLSX.js** - Procesamiento archivos Excel (cargado on-demand)

---

## 🗂️ Estructura de Componentes

### Pattern: Smart vs Dummy Components

```javascript
// SMART COMPONENT (Page) - Maneja estado y lógica
function Afiliados() {
  const [afiliados, setAfiliados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    fetchAfiliados();
  }, []);
  
  const handleCreate = async (data) => {
    // Lógica de creación
  };
  
  return (
    <div className="page-container">
      <HeaderBar onNew={() => setModalOpen(true)} />
      <AfiliadsTable data={afiliados} />
      <ModalCrear open={modalOpen} onSave={handleCreate} />
    </div>
  );
}

// DUMMY COMPONENT - Solo recibe props y renderiza
function AfiliadsTable({ data }) {
  return (
    <table>
      {data.map(afiliado => (
        <tr key={afiliado.id_afiliado}>
          <td>{afiliado.nombres}</td>
          <td>{afiliado.apellidos}</td>
          <td>{afiliado.cedula}</td>
        </tr>
      ))}
    </table>
  );
}
```

---

## 🔐 Autenticación

### Login Flow

```javascript
// 1. Usuario envía credenciales
const handleLogin = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // 2. Guardar token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // 3. Redirigir al dashboard
    navigate('/home');
  }
};
```

### Protected Routes

```javascript
// App.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Uso
<Route path="/afiliados" element={
  <ProtectedRoute>
    <Afiliados />
  </ProtectedRoute>
} />
```

---

## 📡 API Communication

### Cliente Axios Configurado

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Interceptor: Agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Uso en Componentes

```javascript
import api from '../services/api';

const fetchAfiliados = async () => {
  try {
    const response = await api.get('/afiliados');
    setAfiliados(response.data.data);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar afiliados');
  }
};
```

---

## 📊 Gestión de Estado

### useState para Estado Local

```javascript
function Afiliados() {
  const [afiliados, setAfiliados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    departamento: '',
    municipio: '',
    cargo: ''
  });
  
  // ... lógica
}
```

### localStorage para Persistencia

```javascript
// Guardar
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Recuperar
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Eliminar
localStorage.removeItem('token');
localStorage.clear(); // Todo
```

---

## 📤 Importación Masiva de Archivos

### Procesador de Excel/CSV

```javascript
// utils/procesadorArchivos.js

/**
 * Procesa archivos Excel/CSV para extracción de cuotas
 * Autor: Omar Santiago Salazar
 */

export async function procesarArchivoCuotas(file, extension) {
  const cuotasExtraidas = await procesarArchivo(file, extension);
  
  // Enriquecer con datos de afiliados
  const cuotasConInfo = await Promise.all(
    cuotasExtraidas.map(async (cuota) => {
      const response = await api.get(`/afiliados/cedula/${cuota.cedula}`);
      return {
        ...cuota,
        nombres: response.data.data?.nombres || 'NO ENCONTRADO',
        apellidos: response.data.data?.apellidos || '',
        existe: !!response.data.data
      };
    })
  );
  
  return cuotasConInfo;
}
```

### Uso en Componentes

```javascript
const handleFileUpload = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  
  setLoading(true);
  const cuotas = await procesarArchivoCuotas(file, extension);
  setLoading(false);
  
  setCuotasProcesadas(cuotas);
  setMostrarTabla(true);
};
```

---

## 🎨 Estilos

### CSS Modular por Componente

```css
/* Afiliados.css */
.afiliados-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.filters-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.afiliados-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }
}
```

### Variables CSS Globales

```css
/* index.css */
:root {
  --primary-blue: #1976D2;
  --dark-blue: #0D47A1;
  --primary-red: #f44336;
  --primary-yellow: #ffc107;
  --success: #4CAF50;
  --text-dark: #212121;
  --text-light: #757575;
  --border-color: #BDBDBD;
}
```

---

## 🚀 Optimizaciones

### Lazy Loading de Componentes

```javascript
import { lazy, Suspense } from 'react';

const Afiliados = lazy(() => import('./pages/Afiliados'));
const Cuotas = lazy(() => import('./pages/Cuotas'));

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/afiliados" element={<Afiliados />} />
        <Route path="/cuotas" element={<Cuotas />} />
      </Routes>
    </Suspense>
  );
}
```

### Code Splitting

Vite automáticamente hace code splitting. Build optimizado:

```bash
npm run build

dist/
├── assets/
│   ├── index-[hash].js      # Bundle principal
│   ├── Afiliados-[hash].js  # Chunk afiliados
│   ├── Cuotas-[hash].js     # Chunk cuotas
│   └── index-[hash].css     # Estilos
└── index.html
```

---

## 🐛 Debugging

### React DevTools

Instalar extensión: [React Developer Tools](https://react.dev/learn/react-developer-tools)

### Common Issues

**Error: Network Error**
```javascript
// Verificar VITE_API_URL
console.log(import.meta.env.VITE_API_URL);
```

**Error: 401 Unauthorized**
```javascript
// Verificar token
const token = localStorage.getItem('token');
console.log('Token:', token);
```

**Error: CORS**
```javascript
// Verificar que backend tenga CORS habilitado
// Backend debe incluir frontend URL en CORS
```

---

## 🌐 Deployment

### Build de Producción

```bash
npm run build
```

### Railway / Netlify / Vercel

1. Conectar repositorio
2. Configurar variables de entorno (`VITE_API_URL`)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy automático

---

## ✅ Checklist Pre-Deploy

- [ ] `VITE_API_URL` apunta a backend de producción
- [ ] Build sin errores (`npm run build`)
- [ ] Pruebas en entorno de preview
- [ ] CORS configurado en backend
- [ ] Rutas 404 manejadas
- [ ] Imágenes optimizadas
- [ ] console.log removidos (opcional)

---

## 📱 Responsive Design

```css
/* Mobile First */
.container {
  padding: 10px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 30px;
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

---

## 🤝 Contribuciones

Proyecto desarrollado completamente por **Omar Santiago Salazar**.

Para reportar bugs: ossy2607@gmail.com

---

## 📄 Licencia

MIT License - Ver [LICENSE](../LICENSE)

---

## 👨‍💻 Autor

**[Omar Santiago Salazar Yaqueno]**  
📧 [ossy2607@gmail.com]   
🐙 [OmarSsalazar](https://github.com/OmarSsalazar)

---

**Desarrollado con ❤️ en React + Vite**

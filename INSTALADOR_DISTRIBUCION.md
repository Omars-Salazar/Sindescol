# 📦 Guía de Empaquetado y Distribución - SINDESCOL

## ¿Qué hemos configurado?

Se ha configurado una solución completa para:
1. ✅ Empaquetar la app como **instalador .exe** (Windows)
2. ✅ Incluir **actualizaciones automáticas**
3. ✅ Mantener **conexión a Base de Datos en Railway**

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│        APLICACIÓN DESKTOP (Electron)    │
├─────────────────────────────────────────┤
│  Frontend (React - Vite)                │
│  Puerto: 5173 (dev) / 5173 (prod)       │
├─────────────────────────────────────────┤
│  Backend (Node.js - Express)            │
│  Puerto: 4000 (local)                   │
├─────────────────────────────────────────┤
│  Base de Datos (Railway - Cloud)        │
│  URL: DATABASE_URL (env)                │
└─────────────────────────────────────────┘
```

---

## 📝 Archivos Agregados

### 1. `desktop/main.js`
- Punto de entrada de la aplicación Electron
- Inicia el backend Node.js automáticamente
- Carga el frontend React
- Maneja actualizaciones automáticas

### 2. `desktop/preload.js`
- API segura para comunicación entre procesos (IPC)
- Expone funciones de actualizaciones
- Gestiona información del sistema

### 3. `electron-builder.json5`
- Configuración del instalador
- Define qué se incluye en el .exe
- Configura iconos, licencia, etc.

### 4. `.env.example`
- Template de variables de entorno
- Documenta qué se necesita configurar

---

## 🚀 Paso 1: Instalación de Dependencias

Para todo el proyecto (raíz):

```bash
npm install
```

Esto instalará:
- `electron` - Framework de escritorio
- `electron-builder` - Constructor de instaladores
- `electron-updater` - Sistema de actualizaciones
- `concurrently` - Ejecutar múltiples procesos

---

## 🔧 Paso 2: Configuración de Variables de Entorno

### Para desarrollo:

1. **Backend** (`backend/.env`):
```env
DATABASE_URL=mysql://usuario:pass@host:puerto/basedatos
PORT=4000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta
```

2. **Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:4000/api
```

### Para producción:

Crear `.env` en la raíz o en el directorio de instalación con los valores reales de Railway.

---

## 🏃 Desarrollo Local

Para trabajar en desarrollo con tanto backend como frontend ejecutándose:

```bash
npm run dev
```

Esto:
1. Inicia el backend en puerto 4000
2. Inicia el frontend (Vite) en puerto 5173
3. Ambos están conectados a la BD en Railway

---

## 📦 Construcción del Instalador

### Opción 1: Instalador NSIS (Recomendado)

```bash
npm run dist
```

Genera:
- `SINDESCOL-1.0.0-x64.exe` (Instalador tradicional)
- `SINDESCOL-1.0.0-x64.exe.blockmap` (Para autoUpdates)

### Opción 2: Ejecutable Portátil

```bash
npm run dist:portable
```

Genera:
- `SINDESCOL-1.0.0-portable.exe` (Sin instalación)

### Opción 3: Solo empaquetar (sin generar instalador)

```bash
npm run pack
```

---

## 📲 Distribución a Usuarios

### Opción A: Distribución Manual

1. Construye el instalador: `npm run dist`
2. Sube el `.exe` a:
   - Google Drive
   - Dropbox
   - FTP
   - Tu sitio web
3. Los usuarios descargan e instalan

### Opción B: Distribución con Actualizaciones Automáticas (Recomendado)

1. **Crear cuenta GitHub** (si no tienes)

2. **Crear repositorio** público `sindescol`

3. **Configura el token de GitHub** (Windows):
   ```powershell
   $env:GH_TOKEN = "tu_token_github"
   ```
   
   O agrega a `.env`:
   ```env
   GH_TOKEN=tu_token_github
   ```

4. **Edita `electron-builder.json5`**:
   ```json5
   publish: {
     provider: "github",
     owner: "tu-usuario-github",
     repo: "sindescol"
   }
   ```

5. **Construye y publica**:
   ```bash
   npm run dist
   ```
   
   Electron-builder automáticamente:
   - Crea un release en GitHub
   - Sube el `.exe`
   - Sube el `.blockmap` (para delta updates)

---

## 🔄 Sistema de Actualizaciones Automáticas

### ¿Cómo funciona?

1. **Usuario descarga e instala** la app
2. **La app arranca** y verifica si hay actualizaciones
3. **Si hay una versión nueva**:
   - Se muestra notificación al usuario
   - Se descarga automáticamente en segundo plano
   - Cuando termina, muestra "Reinicia para actualizar"
4. **Usuario reinicia** → Nueva versión se instala

### Para publicar una actualización:

1. **Actualiza** el código en tu repo
2. **Aumenta versión** en `package.json`:
   ```json
   "version": "1.0.1"
   ```

3. **Construye el instalador**:
   ```bash
   npm run dist
   ```

4. **Publica en GitHub** (si usas GitHub Releases):
   ```bash
   # El token debe estar en GH_TOKEN
   npm run dist
   ```
   
   Electron-builder automáticamente crea el release.

---

## 🌐 Conexión a Base de Datos en Railway

### Setup ONE-TIME en el servidor de Railway:

1. Mi base de datos ya está en Railway ✅
2. El `backend/src/config/db.js` ya soporta `DATABASE_URL` ✅
3. Solo necesitas agregar la variable `DATABASE_URL` al archivo:
   - `.env` (desarrollo)
   - `.env` (producción/instalador)

### Cómo obtener DATABASE_URL de Railway:

1. Ingresa a [Railway.app](https://railway.app)
2. Abre tu proyecto
3. Va a "Variables"
4. Busca o crea `DATABASE_URL`
5. El formato es: `mysql://usuario:pass@host:puerto/basedatos`

### En la instalación del usuario:

Cuando alguien instale SINDESCOL en su PC:

1. **Primera ejecución**: La app solicitará configuración
   - URL de base de datos en Railway
   - Token/credenciales si es necesario

2. **O**: Agregar archivo `.env` en la carpeta de instalación:
   ```
   C:\Users\Usuario\AppData\Local\Programs\SINDESCOL\resources\.env
   ```

---

## 🔐 Variables de Entorno en Producción

Después que el usuario instala, necesita configurar:

```env
# En C:\Users\<Usuario>\AppData\Local\Programs\SINDESCOL\

DATABASE_URL=mysql://tu_usuario:tu_pass@host.railway.app:puerto/basedatos
JWT_SECRET=una_clave_muy_secreta_cambiada
NODE_ENV=production
```

---

## 🐛 Troubleshooting

### "El backend no inicia"
```bash
# Revisa que el puerto 4000 esté disponible
# O cambia el puerto en desktop/main.js
```

### "Las actualizaciones no funcionan"
1. Verifica que `GH_TOKEN` esté configurado
2. Revisa que el repo sea **público**
3. El usuario necesita tener acceso a internet

### "La BD no conecta"
1. Verifica `DATABASE_URL` en el archivo `.env`
2. Prueba que la URL es válida:
   ```bash
   node -e "console.log(new URL('mysql://usuario:pass@host/db'))"
   ```
3. Posibles permisos de firewall en Railway

### "El .exe es muy grande"
- Normal: ~300-400 MB (incluye Node.js + Chrome)
- Puedes comprimir con WinRAR para distribución

---

## 📋 Checklist para Distribuir

- [ ] `.env.example` completado con valores
- [ ] `electron-builder.json5` apunta al repo GitHub correcto
- [ ] `package.json` tiene versión correcta
- [ ] `GH_TOKEN` configurado (si usas actualizaciones)
- [ ] Backend testea correctamente: `npm run test:all`
- [ ] Construye el instalador sin errores: `npm run dist`
- [ ] Instalador se ejecuta en una PC limpia
- [ ] Puedes conectarte a Railway desde el instalador

---

## 🎯 Scripts Útiles

```bash
# Desarrollo
npm run dev              # Backend + Frontend juntos

# Construcción
npm run dist             # Crea instalador .exe
npm run dist:portable    # Crea .exe portátil (sin instalación)
npm run pack             # Solo empaqueta (sin .exe)

# Testing
npm run test:all         # Tests de todo

# Individual
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
npm run build:frontend   # Build el frontend para dist
```

---

## 📚 Recursos

- [Electron Docs](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [electron-updater](https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater)
- [Railway Docs](https://docs.railway.app)

---

## ¿Preguntas Frecuentes?

**P: ¿Puedo usar esto en Mac/Linux?**
A: Sí, pero necesitas compilar en esa plataforma. Electro build soporta .dmg (Mac) y AppImage/deb (Linux).

**P: ¿Qué pasa si Railroad cambia la URL?**
A: El usuario solo necesita actualizar el `.env` sin reinstalar.

**P: ¿Cuántos usuarios pueden usar la misma app?**
A: Ilimitados si comparten la misma BD en Railway. Cada instalación es independiente.

**P: ¿Puedo hacer beta testing?**
A: Sí, publica en un release como `1.0.0-beta.1` para que los testers lo descarguen.

---

¡Tu aplicación SINDESCOL ya está lista para ser distribuida! 🚀

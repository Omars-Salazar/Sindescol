# Guía para Generar el Instalador v1.0.5

## ✅ Estado Actual

Todos los cambios de código para la versión 1.0.5 están completos:
- ✅ Versión actualizada en todos los package.json
- ✅ Sistema de Toast implementado
- ✅ Mensajes mejorados en todas las páginas
- ✅ Información de versión actualizada en Sidebar y Login
- ✅ Estilos modernizados

## 📦 Para Generar el Instalador

### Opción 1: Instalación Automática Completa (Recomendada)

Abre una **nueva terminal PowerShell** en la carpeta del proyecto y ejecuta:

```powershell
# 1. Asegurarte de que todas las dependencias estén instaladas
npm install

# 2. Instalar electron si no está
npm install electron@^31.7.7 --save-dev

# 3. Limpiar cache y reinstalar dependencias de electron-builder
npx electron-builder install-app-deps

# 4. Generar el instalador
npm run dist
```

### Opción 2: Paso a Paso

```powershell
# Paso 1: Build del frontend
cd frontend
npm run build
cd ..

# Paso 2: Build del backend
cd backend
npm run build:exe
node ..\scripts\copy-backend-exe.js
cd ..

# Paso 3: Generar instalador con electron-builder
npx electron-builder
```

### Opción 3: Build Portable (Sin Instalador)

```powershell
npm run dist:portable
```

## 📁 Archivos Generados

Después de ejecutar el build, encontrarás los instaladores en:

```
D:\GitHub\Sindescol\dist\
├── SINDESCOL-1.0.5-x64.exe        # Instalador completo (~150 MB)
├── SINDESCOL-1.0.5-portable.exe   # Versión portable (~150 MB)
└── ...otros archivos de build
```

## 🚀 Subir el Release a GitHub

1. **Crear un nuevo release en GitHub:**
   - Ve a https://github.com/OmarSsalazar/Sindescol/releases/new
   - Tag version: `v1.0.5`
   - Release title: `SINDESCOL v1.0.5 - Sistema de Notificaciones Mejorado`
   - Descripción: Copia el contenido de `CHANGELOG-1.0.5.md`

2. **Subir los instaladores:**
   - Arrastra el archivo `SINDESCOL-1.0.5-x64.exe`
   - Arrastra el archivo `SINDESCOL-1.0.5-portable.exe`

3. **Publicar el release**

## 🔄 Sistema de Auto-actualización

Una vez publicado el release en GitHub:
- Los usuarios con v1.0.4 recibirán notificación de actualización automáticamente
- Podrán descargar e instalar directamente desde la app
- El proceso mantiene todos los datos del usuario

## ⚠️ Solución de Problemas

### Si electron-builder no funciona:

```powershell
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -r node_modules
npm install

# Reinstalar electron
npm install electron@^31.7.7 --save-dev --force

# Intentar generar instalador
npx electron-builder
```

### Si el build falla:

```powershell
# Verificar que todas las dependencias estén OK
npm run build:frontend
# Si pasa, continuar con:
npm run build:backend:exe
# Si ambos pasan:
npx electron-builder
```

## 📊 Tamaño Esperado

- **Instalador comprimido**: ~50-60 MB
- **Instalador .exe**: ~150-180 MB  
- **App instalada**: ~250-300 MB (incluye frontend, backend, electron, node_modules)

## ✅ Verificación Post-Build

Después de generar el instalador:

1. **Probar el instalador:**
   - Ejecuta `SINDESCOL-1.0.5-x64.exe`
   - Instala en una carpeta de prueba
   - Verifica que se abra correctamente

2. **Verificar características nuevas:**
   - Comprueba que las notificaciones Toast aparezcan
   - Verifica que los mensajes sean intuitivos
   - Confirma que la versión en Sidebar es 1.0.5

3. **Probar auto-actualización (opcional):**
   - Instala v1.0.4 en una VM o PC de prueba
   - Publica el release v1.0.5 en GitHub
   - Verifica que detecte la actualización

## 📝 Notas Adicionales

- El frontend ya está compilado con Vite y está listo
- El backend está empaquetado como .exe portable
- Todos los archivos necesarios están en la carpeta `resources`
- El archivo `.env` se copia automáticamente

---

**¿Necesitas ayuda?** Revisa el [CHANGELOG-1.0.5.md](./CHANGELOG-1.0.5.md) para ver todos los cambios implementados.

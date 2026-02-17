# 🖥️ Desktop - Aplicación Electron

Este directorio contiene la configuración para ejecutar SINDESCOL como una **aplicación de escritorio** en Windows.

## 📁 Estructura

```
desktop/
├── main.js          # Punto de entrada de Electron
├── preload.js       # Script de seguridad (IPC)
└── README.md        # Este archivo
```

## 📋 Archivos

### `main.js`
- Inicia la aplicación Electron
- Lanza el backend Node.js en puerto 4000
- Carga el frontend React
- Maneja actualizaciones automáticas
- Gestiona menúes y eventos de la app

### `preload.js`
- Define API segura entre procesos
- Expone `electron.*` al frontend
- Cancela acceso directo a Node.js por seguridad

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev:desktop
# O desde la raíz:
.\run.ps1 start:electron
```

### Construcción
```bash
# Crear instalador .exe
npm run dist
# O:
.\run.ps1 build:desktop

# Crear ejecutable portable
npm run dist:portable
# O:
.\run.ps1 build:portable
```

## 🔧 Configuración

La configuración principal está en:
- **Raíz**: `electron-builder.json5`
- **Entorno**: `.env` o `.env.local`

## 🌐 Conexión Backend

El archivo `main.js` automáticamente:
1. Inicia el servidor Node.js en puerto 4000
2. Espera 2 segundos a que esté listo
3. Carga el frontend React
4. El frontend se conecta a `http://localhost:4000/api`

## 🔄 Actualizaciones

Las actualizaciones automáticas se configuran en `electron-builder.json5` bajo `publish`:

```json5
publish: {
  provider: "github",
  owner: "tu-usuario",
  repo: "sindescol"
}
```

El token debe estar en la variable `GH_TOKEN` del entorno.

## 🐛 Debugging

Para ver logs de desarrollo:
```bash
# En desarrollo, las DevTools se abren automáticamente
# Presiona F12 para abrir console
```

Para logs de producción, lee:
```
%APPDATA%/SINDESCOL/logs/
```

## 📦 Empaquetado

El `electron-builder.json5` especifica:
- ✅ Qué archivos incluir
- ✅ Dónde buscar recursos
- ✅ Configuración del instalador NSIS
- ✅ Información de versión y autor

## 🔐 Seguridad

- ❌ `nodeIntegration: false` - No permite Node.js en el renderer
- ✅ `contextIsolation: true` - Aísla contextos del proceso
- ✅ `preload.js` - API explícita y controlada

## 📚 Lectura Complementaria

- [INSTALADOR_DISTRIBUCION.md](../INSTALADOR_DISTRIBUCION.md) - Guía completa
- [Electron Docs](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)

# ⚡ Guía Rápida - Crear .exe en 5 Minutos

Si solo quieres crear el instalador rápidamente, sigue esto:

## 🚀 Comando Único

```bash
.\run.ps1 build:desktop
```

**Eso es todo.** Se generará en `dist/SINDESCOL-1.0.0-x64.exe`

---

## 📋 Si Quieres Más Detalles

### Prerequisito: Variables de Entorno
Asegúrate que tu `.env` en la raíz tiene:
```env
DATABASE_URL=mysql://usuario:pass@host:puerto/basedatos
PORT=4000
NODE_ENV=production
```

### Paso 1: Prueba Local (Opcional)
```bash
# Ejecuta la app en Electron antes de crear el .exe
.\run.ps1 start:electron
```

### Paso 2: Crear .exe
```bash
# Opción A (recomendado - instalador tradicional)
.\run.ps1 build:desktop

# Opción B (ejecutable sin instalación)
.\run.ps1 build:portable
```

### Paso 3: Prueba el .exe
- Abre `dist/` en el explorador
- Ejecuta `SINDESCOL-1.0.0-x64.exe`
- Debería instalar y funcionar

---

## 📦 Distribución

### Opción A: Email/Discord/Google Drive
1. Toma el `.exe` de `dist/`
2. Comprime si es muy grande (7-Zip)
3. Comparte el archivo

### Opción B: Actualizaciones Automáticas (GitHub)
1. Lee `UPDATES_AUTOMATIKAS.md`
2. Necesitas repo público en GitHub
3. Las actualizaciones se descargan automáticamente

---

## 🎯 Eso es Todo

✅ Instalador creado  
✅ Los usuarios pueden instalar  
✅ Conecta a Railway automáticamente  
✅ Listo para distribuir  

---

## 📚 Para Más Info
- `SETUP_DESKTOP_COMPLETADO.md` - Resumen completo
- `INSTALADOR_DISTRIBUCION.md` - Guía detallada
- `UPDATES_AUTOMATIKAS.md` - Cómo hacer actualizaciones

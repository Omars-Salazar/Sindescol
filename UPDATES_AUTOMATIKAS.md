# 🔄 Guía de Actualizaciones Automáticas - SINDESCOL

## ¿Cómo funcionan las Actualizaciones?

```
USUARIO DESCARGA .exe  →  INSTALA  →  APP VERIFICA
                                         ↓
                                    ¿HAY VERSIÓN NUEVA?
                                    /              \
                                   SÍ              NO
                                   ↓               ↓
                            DESCARGA     CONTINÚA NORMAL
                            EN BACKGROUND
                                   ↓
                            "REINICIA PARA
                            ACTUALIZAR"
                                   ↓
                            USUARIO REINICIA
                                   ↓
                            VERSIÓN NUEVA ✅
```

---

## 📋 Prerequisitos

### 1. Cuenta GitHub (Gratuita)
- Ir a [github.com](https://github.com)
- Crear cuenta si no tienes
- Crear repositorio **público** `sindescol`

### 2. Token de GitHub
- GitHub → Settings → Developer settings → Personal access tokens
- Crear nuevo token con permiso `public_repo`
- Copiar y guardar en lugar seguro

### 3. Variables de Entorno
```bash
# En tu PC (Windows):
[Environment]::SetEnvironmentVariable("GH_TOKEN", "tu_token_aqui", "User")
```

O en `.env`:
```env
GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📈 Flujo de Actualización

### Paso 1: Hacer Cambios
```bash
# Editar código, fix bugs, nuevas features
# ... haces cambios ...
# Commiteas
git add .
git commit -m "Fix: arreglar bug en afiliados"
git push origin main
```

### Paso 2: Aumentar Versión
**Edita** `package.json` en la RAÍZ:
```json
{
  "version": "1.0.0"           // Cambiar a:
  "version": "1.0.1"           // Para bug fixes
  "version": "1.1.0"           // Para nuevas features
  "version": "2.0.0"           // Para cambios grandes
}
```

### Paso 3: Crear Release en GitHub
```bash
# Desde PowerShell en la raíz del proyecto:

# 1. Crear tag con la versión
git tag v1.0.1

# 2. Push el tag a GitHub
git push origin v1.0.1
```

### Paso 4: Build y Publicación Automática
```bash
# Asegúrate que GH_TOKEN está en el entorno:
echo $env:GH_TOKEN

# Construye el instalador
npm run dist

# electron-builder automáticamente:
# 1. Detecta el tag v1.0.1
# 2. Crea un Release en GitHub
# 3. Sube el .exe y .exe.blockmap
# 4. Los usuarios verán "Actualización disponible" ✅
```

---

## 🎯 Ejemplo Práctico Paso a Paso

### Escenario: Arreglaste un bug en usuarios

```bash
# 1. Hacer el cambio
# Edita backend/src/controllers/usuariosController.js
# ... fix el bug ...

# 2. Commitear
git add .
git commit -m "Fix: corrección en validación de usuarios"
git push origin main

# 3. Preparar release
# Edita package.json:
# "version": "1.0.0" → "version": "1.0.1"

git add package.json
git commit -m "Bump version to 1.0.1"
git push origin main

# 4. Crear release
git tag v1.0.1
git push origin v1.0.1

# 5. Build
npm run dist

# ✅ ¡Listo! Los usuarios verán:
# "SINDESCOL Update Available"
# "Restart to Install"
```

---

## 📦 Qué incluye el .exe updatable

El archivo `.exe.blockmap` es crucial:
- Permite **delta updates** (solo descarga cambios)
- Reduce tiempo de descarga
- Generado automáticamente por `electron-builder`
- Se sube a GitHub automáticamente

---

## 🔍 Verificar Que Funcionan las Actualizaciones

### Test en tu PC

```bash
# 1. Construye versión actual
npm run dist

# 2. Instala en tu PC
# Ejecuta SINDESCOL-1.0.0-x64.exe

# 3. Abre DevTools (F12) y ve a Console
# Deberías ver logs de:
# "Checking for updates"
# "No updates available" (porque es la version actual)

# 4. Ahora, cambia version en package.json a 1.0.1
# 5. Construye de nuevo: npm run dist
# 6. Crea release en GitHub: git tag v1.0.1
# 7. Publica: npm run dist (de nuevo)
# 8. En tu app instalada, presiona Ctrl+Shift+R o espera 60min
# Deberías ver: "Update Available!"
```

---

## 🛑 Troubleshooting Actualizaciones

### ❌ "Actualización no aparece"

**Verificar:**
1. ✅ El `GH_TOKEN` está en el entorno:
   ```bash
   echo $env:GH_TOKEN
   # Debe mostrar algo como: ghp_xxxxx...
   ```

2. ✅ El repositorio es **PÚBLICO** (no privado)
   - GitHub → Settings → General → Danger Zone
   - Debe decir "Public"

3. ✅ El version en `package.json` es mayor:
   - App actual: 1.0.0
   - Nueva: 1.0.1 o superior

4. ✅ El build salió sin errores:
   ```bash
   npm run dist
   # Debe terminar con: ✅ Build complete
   ```

### ❌ "GH_TOKEN no funciona"

```bash
# Verifica que es válido:
curl -H "Authorization: token $env:GH_TOKEN" https://api.github.com/user

# Debe retornar información de tu usuario
# Si error 401: Token es inválido
```

### ❌ "El .exe es muy grande"

- **Normal**: 300-400 MB (incluye Node + Chrome + App)
- Para distribuir by email, comprime con 7-Zip o WinRAR
- GitHub permite hasta 2GB por release

---

## 🎓 Mejores Prácticas

### Versionado Semántico (SemVer)

```
MAJOR.MINOR.PATCH
  ↑     ↑     ↑
  │     │     └─ Bug fixes: 1.0.0 → 1.0.1
  │     └─ Nuevas features: 1.0.0 → 1.1.0
  └─ Cambios incompatibles: 1.0.0 → 2.0.0
```

**Ejemplos:**
- Bug fix: `1.0.0` → `1.0.1`
- Nueva feature: `1.0.0` → `1.1.0`
- Refactor grande: `1.0.0` → `2.0.0`

### Release Notes

Cuando crees el tag, agrega descripción:

```bash
# Opción 1: GitHub Web UI
# GitHub → Releases → Draft new release
# Title: Release v1.0.1
# Description: 
# - Fix: Error en validación de usuarios
# - Improve: Mejor mensaje de error
# - Update: Dependencias

# Opción 2: Por console
git tag -a v1.0.1 -m "Release v1.0.1
- Fix: Error en validación de usuarios
- Improve: Mejor mensaje de error"
git push origin v1.0.1
```

---

## 📊 Monitorear Actualizaciones

### Ver releases en GitHub
```
https://github.com/tu-usuario/sindescol/releases
```

### Ver descargas activas
GitHub mostará cuántos usuarios instalaron cada versión.

---

## 🚀 Crear Beta Updates

Para testing antes de enviar a producción:

```bash
# Versión beta
"version": "1.0.1-beta.1"

# Crear tag
git tag v1.0.1-beta.1
git push origin v1.0.1-beta.1

# Build
npm run dist

# Los usuarios verán como "pre-release"
# Los testers pueden descargar manualmente desde GitHub Releases
```

---

## 🔐 Firmar .exe (Opcional)

Para que Windows no muestre "Unknown Publisher":

1. Compra certificado de firma (código) en DigiCert, Sectigo, etc.
2. En `electron-builder.json5`:
   ```json5
   win: {
     certificateFile: "ruta/a/certificado.pfx",
     certificatePassword: "contraseña"
   }
   ```

3. Build:
   ```bash
   npm run dist
   ```

El .exe se mostrará como:
- ✅ "Published by TU NOMBRE" (en lugar de "Unknown")

---

## 📞 Referencia Rápida

```bash
# Flujo rápido de actualización:

# 1. Hacer cambios y subirlos
git add . && git commit -m "Description" && git push

# 2. Actualizar versión
# Edita package.json: "version": "1.0.1"

# 3. Preparar release
git add package.json
git commit -m "Bump to 1.0.1"
git push

# 4. Crear tag
git tag v1.0.1
git push origin v1.0.1

# 5. Build y publicar
npm run dist

# ✅ ¡Listo! Los usuarios ven la actualización
```

---

## 🎯 Resumen

| Acción | Comando | Se Distribuye a Usuarios |
|--------|---------|-------------------------|
| Cambios en código | `git push` | ❌ No automático |
| Cambios + versión actualizada | `git tag v1.0.1` | ⏳ Próximo build |
| Build con tag nuevo | `npm run dist` | ✅ SÍ - automático |
| Usuario ejecuta app | - | ✅ Detecta update |

---

**¡Tus usuarios siempre tendrán la última versión! 🎉**

Para más detalles, consulta:
- [electron-updater docs](https://github.com/electron-userland/electron-builder/wiki/auto-update)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)

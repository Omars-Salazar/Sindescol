# SINDESCOL v1.1.6 - Notas de Actualización

## 🔐 Seguridad (Release de endurecimiento)

### ✅ Correcciones críticas aplicadas
- **Eliminada exposición de secretos en historial Git** (`backend/.env`, `resources/.env`, `.env.local`) mediante limpieza de historial remoto.
- **Eliminado empaquetado de `.env` en distribución** para evitar filtración de credenciales en instaladores.
- **Eliminada copia automática de `.env`** en el pipeline de build de escritorio.
- **Endpoints de observabilidad protegidos**:
  - `/api/health/detailed`
  - `/api/metrics`
  - `/api/metrics/db`
  Ahora requieren autenticación y rol `presidencia_nacional`.
- **Reducida fuga de información interna en login**: ya no se expone el mensaje técnico de error de base de datos al cliente.

### ✅ Dependencias y vulnerabilidades
- Actualizadas dependencias para mitigar CVEs relevantes detectados en backend/frontend.
- Validación final con auditoría de runtime:
  - `backend`: 0 vulnerabilidades (`npm audit --omit=dev`)
  - `frontend`: 0 vulnerabilidades (`npm audit --omit=dev`)

## 🛠️ Cambios técnicos incluidos
- `package.json` (raíz): versión `1.1.6` y configuración de build endurecida.
- `scripts/copy-backend-exe.js`: removida copia de `.env` a recursos de release.
- `backend/src/routes/healthRoutes.js`: control de acceso por rol para métricas y health detallado.
- `backend/src/controllers/authController.js`: sanitización de respuesta de error en login.
- `backend/package-lock.json`, `frontend/package-lock.json`: actualización de locks para seguridad.

## 📦 Resultado de validación pre-release
- Build frontend: ✅
- Build backend exe: ✅
- Runtime audit backend/frontend: ✅
- Repo sincronizado con `origin/main`: ✅

## ⚠️ Nota operativa
Después de la limpieza de historial, cualquier clon antiguo del repositorio debe:
1. Re-clonarse, o
2. Hacer reset duro al nuevo historial remoto.

## 👨‍💻 Metadata
- **Versión**: 1.1.6
- **Tipo de release**: Seguridad / Hardening
- **Fecha**: Marzo 2026

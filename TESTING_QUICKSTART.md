# 🚀 Quick Start - Testing SINDESCOL

## ⚡ TL;DR (Versión Rápida)

### Windows (PowerShell)
```powershell
# Ver todos los comandos disponibles
.\run.ps1 help

# Ejecutar todos los tests
.\run.ps1 test:all

# Tests del backend en modo watch
.\run.ps1 test:watch backend

# Generar reportes de cobertura
.\run.ps1 coverage:all

# Iniciar dev
.\run.ps1 dev
```

### Mac/Linux (Bash)
```bash
# Ver todos los comandos disponibles
bash run.sh help

# Ejecutar todos los tests
bash run.sh test:all

# Tests del backend en modo watch
bash run.sh test:watch backend

# Generar reportes de cobertura
bash run.sh coverage:all

# Iniciar dev
bash run.sh dev
```

### O Directamente en Carpetas
```bash
# Backend
cd backend
npm test                  # Ejecutar tests
npm run test:watch      # Modo watch
npm run test:coverage   # Cobertura

# Frontend
cd frontend
npm test                  # Ejecutar tests
npm run test:watch      # Modo watch
npm run test:coverage   # Cobertura
```

---

## 📚 Documentación Completa

Lee **`TESTING.md`** para:
- Explicación detallada de cómo funciona todo
- Estructura del proyecto de testing
- Cómo escribir tests
- Troubleshooting
- Buenas prácticas

---

## 🎯 Flujo Típico de Desarrollo

```
1. ✏️  Escribo código nuevo
        ↓
2. 🧪 Escribo tests
        ↓
3. ▶️  npm run test:watch (veo tests pasar en tiempo real)
        ↓
4. ⬆️  git push
        ↓
5. 🤖 GitHub Actions ejecuta tests automáticamente
        ↓
6. ✅ Si pasan → Mergeo el PR
```

---

## 📊 Estructura de Carpetas

```
sindescol/
├── backend/
│   ├── __tests__/          ← Tests aquí
│   │   ├── unit/
│   │   └── integration/
│   ├── jest.config.js      ← Config de Jest
│   └── package.json
│
├── frontend/
│   ├── src/__tests__/      ← Tests aquí
│   │   ├── components/
│   │   └── utils/
│   ├── vitest.config.js    ← Config de Vitest
│   └── package.json
│
├── .github/workflows/
│   └── tests.yml           ← CI/CD automático
│
├── TESTING.md              ← Documentación completa
├── run.ps1                 ← Scripts para Windows
├── run.sh                  ← Scripts para Mac/Linux
└── package.json            ← (Raíz)
```

---

## ✅ Checklist para Nuevo Desarrollador

- [ ] Instalar dependencias: `npm install` en `backend/` y `frontend/`
- [ ] Ejecutar tests: `.\run.ps1 test:all` (Windows) o `bash run.sh test:all` (Mac/Linux)
- [ ] Leer `TESTING.md`
- [ ] Crear primer test siguiendo los ejemplos
- [ ] Ejecutar modo watch: `.\run.ps1 test:watch backend`

---

## 🤔 Preguntas Frecuentes

**P: ¿Dónde pongo mis tests?**
- Backend: `backend/__tests__/unit/` o `backend/__tests__/integration/`
- Frontend: `frontend/src/__tests__/components/` o `frontend/src/__tests__/utils/`

**P: ¿Cómo ejecuto solo un test?**
```bash
npm test -- miarchivo.test.js  # Un archivo específico
npm test -- --testNamePattern="validar"  # Patrón de nombre
```

**P: ¿Los tests corren automáticamente?**
- En CI/CD: Sí, con GitHub Actions
- En local: Solo si ejecutas `npm test` o modo watch

**P: ¿Qué significa "coverage"?**
Qué porcentaje de tu código está cubierto por tests. Nivel mínimo: 50%

**P: ¿Por qué algunos tests fallan en CI pero pasan en local?**
Diferencias de entorno. Ejecuta: `npm test:watch` y revisa logs detallados

---

## 🆘 Rápido Fix

```bash
# Los tests no se ejecutan
npm install  # Reinstala dependencias

# Error "module not found"
npm install --save-dev jest supertest vitest @testing-library/react

# Los tests son lentos
npm test -- --maxWorkers=1  # Menos workers

# Ver logs detallados
npm test -- --verbose
```

---

## 🎓 Próximos Pasos

1. Lee `TESTING.md` completo
2. Escribe 3-5 tests en tu primer PR
3. Aprende a escribir tests E2E (próximamente)
4. Mantén cobertura > 60%

---

¡**Ahora sí, a escribir pruebas! 🚀**

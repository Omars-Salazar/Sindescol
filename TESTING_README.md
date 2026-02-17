# 🧪 Entorno de Testing - SINDESCOL

## ¡Ya tenemos configured un sistema completo de testing! ✅

Aquí está todo lo que necesitas saber sobre cómo funciona el testing en este proyecto.

---

## 📚 Documentación

Hay **3 documentos principales** que debes leer dependiendo de qué necesites:

### 1. **TESTING_QUICKSTART.md** ⚡ (Lee primero)
**Para**: "Quiero ejecutar tests AHORA"
- Comandos rápidos
- Scripts Windows/Mac/Linux
- FAQ básicas
- ~5 minutos de lectura

```bash
# Ejemplo rápido
.\run.ps1 test:all           # Windows
bash run.sh test:all         # Mac/Linux
```

### 2. **TESTING_VISUAL.md** 🎨 (Lee segundo)
**Para**: "Quiero ENTENDER cómo funciona todo"
- Diagramas y flujos visuales
- Explicación de cada componente
- Comparación Jest vs Vitest
- Ejemplos visuales
- ~10 minutos de lectura

### 3. **TESTING.md** 📖 (Referencia completa)
**Para**: "Necesito documentación DETALLADA"
- Estructura completa
- Cómo escribir tests avanzados
- Troubleshooting exhaustivo
- Buenas prácticas
- Recursos externos
- ~30 minutos para lectura completa

---

## 🚀 Inicio Rápido (30 segundos)

### Windows (PowerShell)

```powershell
# Ver comandos disponibles
.\run.ps1 help

# Ejecutar todos los tests
.\run.ps1 test:all

# Modo watch (updates en tiempo real)
.\run.ps1 test:watch backend
```

### Mac/Linux (Bash)

```bash
# Ver comandos disponibles
bash run.sh help

# Ejecutar todos los tests
bash run.sh test:all

# Modo watch
bash run.sh test:watch backend
```

### O Directamente

```bash
# Backend
cd backend
npm test
npm run test:watch
npm run test:coverage

# Frontend
cd frontend
npm test
npm run test:watch
npm run test:coverage
```

---

## 📁 Estructura

```
sindescol/
├── backend/
│   ├── __tests__/
│   │   ├── unit/services/usuarios.service.test.js
│   │   └── integration/routes/afiliados.routes.test.js
│   ├── jest.config.js
│   └── package.json (con scripts de test)
│
├── frontend/
│   ├── src/__tests__/
│   │   ├── components/SimpleButton.test.jsx
│   │   └── setup.js
│   ├── vitest.config.js
│   └── package.json (con scripts de test)
│
├── .github/workflows/
│   └── tests.yml (CI/CD automático)
│
├── TESTING_QUICKSTART.md    ⚡ Lee primero
├── TESTING_VISUAL.md        🎨 Entiende cómo funciona
├── TESTING.md              📖 Referencia completa
│
├── run.ps1                 (Scripts Windows)
└── run.sh                  (Scripts Mac/Linux)
```

---

## 🎯 ¿Qué Quiero Hacer?

### "Quiero ejecutar tests"
→ Lee **TESTING_QUICKSTART.md** + ejecuta `.\run.ps1 test:all`

### "No entiendo cómo funciona"
→ Lee **TESTING_VISUAL.md** (tiene diagramas)

### "Quiero escribir tests"
→ Lee **TESTING.md** sección "Escribir Tests"

### "GitHub Actions no funciona"
→ Lee **TESTING.md** sección "Troubleshooting"

### "Quiero mejorar cobertura"
→ Ejecuta `npm run test:coverage` + lee reportes HTML

---

## ✨ Lo que está Configurado

### Backend (Jest)
- ✅ Configración en `jest.config.js`
- ✅ Tests unitarios en `backend/__tests__/unit/`
- ✅ Tests de integración en `backend/__tests__/integration/`
- ✅ Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`

### Frontend (Vitest)
- ✅ Configuración en `vitest.config.js`
- ✅ Tests de componentes en `frontend/src/__tests__/`
- ✅ Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:ui`

### CI/CD (GitHub Actions)
- ✅ Workflow en `.github/workflows/tests.yml`
- ✅ Corre automáticamente en cada push
- ✅ Testea en Node 18.x y 20.x
- ✅ Genera reportes de cobertura
- ✅ Sube a Codecov

---

## 📊 Ejemplo de Output

Cuando ejecutas `npm test`:

```
✓ backend/__tests__/unit/services/usuarios.service.test.js (4)
  ✓ validarCedula()
    ✓ debe validar una cédula válida
    ✓ debe rechazar cédula vacía
  ✓ validarEmail()
    ✓ debe validar un email correcto
    ✓ debe rechazar email sin @

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.345s
```

---

## 🤖 GitHub Actions (Automático)

Cada vez que haces `git push`:

1. ✅ GitHub detecta el push
2. ✅ Inicia el workflow `tests.yml`
3. ✅ Ejecuta tests en Backend y Frontend
4. ✅ Genera reportes de cobertura
5. ✅ Muestra status ✅ o ❌ en el PR

**Ver resultados**: GitHub → Actions → Último workflow

---

## ✅ Checklist para Nuevo Dev

- [ ] Léeme completamente
- [ ] Lee **TESTING_QUICKSTART.md**
- [ ] Ejecuta `.\run.ps1 test:all` (o `bash run.sh test:all`)
- [ ] Lee **TESTING_VISUAL.md** (especialmente diagramas)
- [ ] Crea tu primer test (copia un ejemplo)
- [ ] Ejecuta `npm run test:watch` para desarrollar
- [ ] Lee **TESTING.md** para casos avanzados

---

## 🆘 Problemas Rápidos

**"Los tests no se ejecutan"**
```bash
npm install
npm test
```

**"No encuentro los tests"**
- Backend: `backend/__tests__/**/*.test.js`
- Frontend: `frontend/src/__tests__/**/*.test.jsx`

**"¿Cómo escribo un test?"**
→ Mira ejemplos en `backend/__tests__/unit/services/usuarios.service.test.js`

**"¿Cómo corro solo un archivo?"**
```bash
npm test -- usuarios.test.js
```

**"¿Cómo veo cobertura?"**
```bash
npm run test:coverage
# Abre: coverage/lcov-report/index.html
```

---

## 📚 Lectura Recomendada (En Orden)

1. **Este archivo** (ya lo estás leyendo!)
2. **TESTING_QUICKSTART.md** ← Dale 5 minutos
3. **TESTING_VISUAL.md** ← Entiende los diagramas
4. **TESTING.md** ← Lee cuando necesites detalles

---

## 🎓 Niveles

```
Nivel 1: Ejecutar tests
  npm test

Nivel 2: Entender tests
  Lee TESTING_VISUAL.md

Nivel 3: Escribir tests
  Lee TESTING.md + mira ejemplos

Nivel 4: Mejorar cobertura
  npm run test:coverage + agrega tests

Nivel 5: Optimizar pipeline
  Edita .github/workflows/tests.yml
```

---

## 🚀 Próximos Pasos

1. **Ahora**: Ejecuta `.\run.ps1 test:all` y ve los tests correr
2. **Luego**: Lee TESTING_QUICKSTART.md (5 min)
3. **Después**: Lee TESTING_VISUAL.md (10 min)
4. **Finalmente**: Crea tu primer test basado en los ejemplos

---

## 📞 Recursos

- Jest Docs: https://jestjs.io/
- Vitest Docs: https://vitest.dev/
- React Testing Library: https://testing-library.com/
- GitHub Actions: https://docs.github.com/en/actions

---

## ✨ Resumen

```
┌────────────────────────────────────────────────┐
│ ✅ TESTING COMPLETAMENTE CONFIGURADO           │
│                                                 │
│ • Backend:  Jest (Tests unitarios + integración) │
│ • Frontend: Vitest (Tests de componentes)      │
│ • CI/CD:    GitHub Actions (Automático)        │
│                                                 │
│ → Ahora solo necesitas ESCRIBIR TESTS ✍️       │
└────────────────────────────────────────────────┘
```

---

**¡Adelante! A escribir tests de calidad 🚀**

Si tienes dudas, consulta primero **TESTING_QUICKSTART.md** luego **TESTING.md**.

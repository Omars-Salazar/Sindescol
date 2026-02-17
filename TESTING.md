# 🧪 Guía de Testing - Proyecto SINDESCOL

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Estructura](#estructura)
3. [Instalación](#instalación)
4. [Ejecutar Tests](#ejecutar-tests)
5. [Escribir Tests](#escribir-tests)
6. [CI/CD Automático](#cicd-automático)
7. [Buenas Prácticas](#buenas-prácticas)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visión General

El proyecto SINDESCOL ahora tiene un **sistema completo de testing** con 3 capas:

```
┌──────────────────────────────────────────────────────┐
│  🌐 E2E TESTS (Próximamente: Playwright)             │
│     Flujos completos del usuario                     │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  🔗 INTEGRATION TESTS (Supertest + Jest)             │
│     APIs + Servicios + Bases de Datos                │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  ⚙️ UNIT TESTS (Jest Backend + Vitest Frontend)     │
│     Funciones aisladas + Componentes React           │
└──────────────────────────────────────────────────────┘
```

### Herramientas Utilizadas

| Aspecto | Herramienta | Versión |
|---------|------------|---------|
| Backend | **Jest** | 29.x |
| Backend | **Supertest** | 6.x |
| Frontend | **Vitest** | 1.x |
| Testing Library | **React Testing Library** | 14.x |
| CI/CD | **GitHub Actions** | Latest |

---

## 📁 Estructura

```
sindescol/
├── backend/
│   ├── __tests__/                 ← 🧪 TESTS DEL BACKEND
│   │   ├── unit/                  ← Tests unitarios
│   │   │   └── services/
│   │   │       └── usuarios.service.test.js
│   │   └── integration/           ← Tests de integración
│   │       └── routes/
│   ├── src/
│   │   ├── app.js
│   │   ├── services/
│   │   └── controllers/
│   ├── jest.config.js             ← Configuración de Jest
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── __tests__/             ← 🧪 TESTS DEL FRONTEND
│   │   │   ├── components/
│   │   │   │   └── SimpleButton.test.jsx
│   │   │   ├── utils/
│   │   │   └── setup.js           ← Setup global
│   │   └── components/
│   ├── vitest.config.js           ← Configuración de Vitest
│   ├── vite.config.js
│   └── package.json
│
└── .github/
    └── workflows/
        └── tests.yml              ← 🤖 GitHub Actions CI/CD
```

---

## 🚀 Instalación

### Paso 1: Instalar Dependencias Backend

```bash
cd backend
npm install
# También instala devDependencies con jest y supertest
```

### Paso 2: Instalar Dependencias Frontend

```bash
cd frontend
npm install
# También instala devDependencies con vitest
```

### Paso 3: Verificar Instalación

```bash
# Backend
cd backend
npm test --version  # Debe mostrar Jest version

# Frontend
cd frontend
npm test --version  # Debe mostrar Vitest version
```

---

## 🏃 Ejecutar Tests

### Backend - Jest

```bash
cd backend

# ✅ Ejecutar todos los tests UNA VEZ
npm test

# 👀 Modo "watch" - Ejecuta tests automáticamente al guardar archivos
npm run test:watch

# 📊 Generar reporte de cobertura
npm run test:coverage

# 🐛 Modo debug (usa inspector de Node)
npm run test:debug
```

#### Output de Ejemplo:
```
 PASS  __tests__/unit/services/usuarios.service.test.js
  Usuarios Service - Ejemplo
    validarCedula()
      ✓ debe validar una cédula válida (2 ms)
      ✓ debe rechazar cédula vacía (1 ms)
    validarEmail()
      ✓ debe validar un email correcto (1 ms)
      ✓ debe rechazar email sin @ (1 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.345 s
```

### Frontend - Vitest

```bash
cd frontend

# ✅ Ejecutar todos los tests
npm test

# 👀 Modo "watch" - Ejecuta tests al guardar
npm run test:watch

# 📊 Reporte de cobertura
npm run test:coverage

# 🎨 UI interactiva para ver tests
npm run test:ui
```

#### Output de Ejemplo:
```
✓ src/__tests__/components/SimpleButton.test.jsx (2)
  ✓ SimpleButton Component (2)
    ✓ debe renderizar el botón con el texto correcto
    ✓ debe llamar onClick cuando se hace clic

Test Files  1 passed (1)
Tests  2 passed (2)
Duration  234ms
```

---

## 📝 Escribir Tests

### Estructura Básica de un Test

```javascript
// Importar lo necesario
import { describe, it, expect } from 'vitest'; // Frontend
// import { describe, it, expect } from '@jest/globals'; // Backend

describe('Nombre de la suite de tests', () => {
  
  it('debe hacer algo específico', () => {
    // ARRANGE - Preparar datos
    const resultado = miFunction(5);
    
    // ACT - (Ya ejecutada la función)
    
    // ASSERT - Verificar resultado
    expect(resultado).toBe(10);
  });
  
  it('debe manejar errores', () => {
    expect(() => {
      miFunction('string invalido');
    }).toThrow();
  });
});
```

### Ejemplo Real: Service Backend (Jest)

**Archivo: `backend/__tests__/unit/services/usuarios.service.test.js`**

```javascript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as usuariosService from '../../../src/services/usuariosService.js';

describe('UsuariosService', () => {
  
  describe('createUsuario()', () => {
    it('debe crear un usuario válido', async () => {
      const userData = {
        cedula: '12345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@example.com'
      };
      
      const usuario = await usuariosService.createUsuario(userData);
      
      expect(usuario).toHaveProperty('id');
      expect(usuario.email).toBe('juan@example.com');
    });

    it('debe rechazar usuario sin email', async () => {
      const userData = {
        cedula: '12345678',
        nombres: 'Juan',
        apellidos: 'Pérez'
      };
      
      await expect(
        usuariosService.createUsuario(userData)
      ).rejects.toThrow('Email es requerido');
    });
  });
});
```

### Ejemplo Real: Componente Frontend (Vitest)

**Archivo: `frontend/src/__tests__/components/ModalCrearAfiliado.test.jsx`**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalCrearAfiliado } from '../../components/afiliados/ModalCrearAfiliado';

describe('ModalCrearAfiliado', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  it('debe renderizar el modal cuando isOpen es true', () => {
    render(
      <ModalCrearAfiliado 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    expect(screen.getByText('Crear Nuevo Afiliado')).toBeInTheDocument();
  });

  it('debe llamar onClose cuando se cierra el modal', async () => {
    const user = userEvent.setup();
    render(
      <ModalCrearAfiliado 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    await user.click(screen.getByRole('button', { name: '×' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('debe cambiar de pestaña cuando se hace clic', async () => {
    const user = userEvent.setup();
    render(
      <ModalCrearAfiliado 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    const seguridadTab = screen.getByRole('button', { name: /Seguridad Social/i });
    await user.click(seguridadTab);
    
    expect(seguridadTab).toHaveClass('active');
  });
});
```

---

## 🤖 CI/CD Automático

### ¿Cómo Funciona?

Cada vez que haces **push** o **pull request** a `main` o `develop`, GitHub Actions:

1. ✅ Clona el código
2. ✅ Instala dependencias (Node 18 y 20)
3. ✅ Ejecuta tests del backend
4. ✅ Ejecuta tests del frontend
5. ✅ Genera reportes de cobertura
6. ✅ Sube cobertura a Codecov
7. ✅ Muestra resultado en el PR

### Ver Resultados

```
Desde GitHub:
1. Ve a tu repositorio
2. Click en "Actions"
3. Haz click en el workflow más reciente
4. Ve los logs detallados
```

### Archivo de Configuración

**`.github/workflows/tests.yml`** - Ya está configurado ✅

---

## ✨ Buenas Prácticas

### 1. **Tests Descriptivos**

```javascript
// ❌ MAL
it('test 1', () => expect(5).toBe(5));

// ✅ BIEN
it('debe sumar dos números correctamente', () => {
  const resultado = sumar(2, 3);
  expect(resultado).toBe(5);
});
```

### 2. **AAA Pattern - Arrange, Act, Assert**

```javascript
it('debe aplicar descuento a la cuota', () => {
  // ARRANGE - Preparar
  const cuota = { monto: 100, descuento: 0.1 };
  
  // ACT - Ejecutar
  const resultado = aplicarDescuento(cuota);
  
  // ASSERT - Verificar
  expect(resultado).toBe(90);
});
```

### 3. **Tests Independientes**

```javascript
// ✅ BIEN - Cada test es independiente
describe('CuotasService', () => {
  it('test 1 - no afecta test 2', () => {
    // Su propia setup
  });
  
  it('test 2 - no depende de test 1', () => {
    // Su propia setup
  });
});

// ❌ MAL - Tests dependientes
it('crear cuota', () => createCuota());
it('debe obtener la cuota creada anterior', () => {
  // Depende del test anterior!
});
```

### 4. **Cobertura de Casos**

```javascript
describe('validarMunicipio', () => {
  it('debe aceptar municipios válidos', () => {
    expect(validarMunicipio('Cali')).toBe(true);
  });
  
  it('debe rechazar strings vacíos', () => {
    expect(validarMunicipio('')).toBe(false);
  });
  
  it('debe rechazar null/undefined', () => {
    expect(validarMunicipio(null)).toBe(false);
    expect(validarMunicipio(undefined)).toBe(false);
  });
  
  it('debe rechazar números', () => {
    expect(validarMunicipio(123)).toBe(false);
  });
});
```

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'jest'"

```bash
cd backend
npm install --save-dev jest supertest
```

### Error: "vitest not found"

```bash
cd frontend
npm install --save-dev vitest @testing-library/react jsdom
```

### Tests No Se Ejecutan

```bash
# Verifica que jest.config.js existe
ls jest.config.js  # Backend

# Verifica que vitest.config.js existe
ls vitest.config.js  # Frontend

# Ejecuta con verbose
npm test -- --verbose
```

### Cobertura Muy Baja

```bash
# Ver qué líneas NO están cubiertas
npm run test:coverage

# Abre el reporte HTML
# Backend: backend/coverage/lcov-report/index.html
# Frontend: frontend/coverage/lcov-report/index.html
```

### Tests Lentos

```bash
# Ejecuta solo tests de archivo específico
npm test -- usuarios.service.test.js

# Ejecuta solo tests que coinciden con patrón
npm test -- --testNamePattern="debe validar"

# Ejecuta con menos workers
npm test -- --maxWorkers=1
```

### GitHub Actions Fallando

1. Ve a Actions en GitHub
2. Click en el workflow fallido
3. Expande "Run tests"
4. Lee el error detallado
5. Copia el error y búscalo en troubleshooting arriba

---

## 📊 Reportes de Cobertura

Después de ejecutar `npm run test:coverage`:

```
backend/coverage/lcov-report/   ← Abre index.html en navegador
frontend/coverage/lcov-report/  ← Abre index.html en navegador
```

**Interpretación:**
- 🟢 Verde (> 80%): Excelente cobertura
- 🟡 Amarillo (> 50%): Buena cobertura
- 🔴 Rojo (< 50%): Necesita más tests

---

## 🎯 Próximos Pasos

### Para Mejorar la Cobertura:

1. **Agregar más tests unitarios** en `__tests__/unit/`
2. **Agregar tests de integración** en `__tests__/integration/`
3. **Agregar E2E tests** con Playwright (próximamente)

### Template para Crear Tests:

```bash
# Backend
touch backend/__tests__/unit/services/miServicio.test.js

# Frontend
touch frontend/src/__tests__/components/MiComponente.test.jsx
```

---

## 📚 Recursos Útiles

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**¡Ahora estás listo para escribir tests de calidad! 🚀**

Cualquier duda, revisa esta guía o contacta al equipo.

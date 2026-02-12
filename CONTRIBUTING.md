# 🤝 Guía de Contribución - SINDESCOL

> **Nota:** Este proyecto fue desarrollado íntegramente por **Omar Santiago Salazar** como proyecto personal. Esta guía está disponible para referencia futura en caso de que se abra a contribuciones externas.

---

## 📋 Información del Proyecto

**SINDESCOL** es un sistema de gestión sindical desarrollado desde cero utilizando:
- **Backend:** Node.js + Express + MySQL
- **Frontend:** React + Vite
- **Arquitectura:** MVC con capas (Routes → Controllers → Services)

---

## 🚀 Cómo Empezar

### 1. Fork del Proyecto

Si deseas contribuir en el futuro, realiza un fork del repositorio:

```bash
# Fork en GitHub UI
# Luego clona tu fork
git clone https://github.com/tu-usuario/sindescol.git
cd sindescol
```

### 2. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar Entorno Local

Revisar documentación completa en:
- [`backend/README.md`](backend/README.md)
- [`frontend/README.md`](frontend/README.md)

---

## 🔧 Desarrollo

### Convenciones de Código

#### JavaScript/JSX

```javascript
// ✅ Usar const/let (nunca var)
const variable = 'valor';
let contador = 0;

// ✅ Arrow functions
const miFuncion = (param) => {
  return param * 2;
};

// ✅ Async/await (no callbacks)
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// ✅ Nombres descriptivos
const obtenerAfiliadoPorCedula = (cedula) => { };

// ❌ Nombres vagos
const getData = (x) => { };
```

#### Imports

```javascript
// ✅ Orden de imports
// 1. Librerías externas
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Componentes locales
import Navbar from './components/Navbar';

// 3. Estilos
import './styles/App.css';
```

#### Componentes React

```javascript
// ✅ Componente funcional con hooks
function MiComponente({ prop1, prop2 }) {
  const [estado, setEstado] = useState(null);
  
  useEffect(() => {
    // Lógica
  }, []);
  
  return (
    <div className="mi-componente">
      {/* JSX */}
    </div>
  );
}

export default MiComponente;
```

### Estructura de Commits

```bash
# ✅ Commits descriptivos
git commit -m "feat: Agregar filtro por departamento en afiliados"
git commit -m "fix: Corregir validación de cédula duplicada"
git commit -m "docs: Actualizar README con instrucciones de deploy"
git commit -m "style: Mejorar responsive en tabla de cuotas"
git commit -m "refactor: Simplificar lógica de procesamiento CSV"

# Prefijos estándar:
# feat: Nueva característica
# fix: Corrección de bug
# docs: Documentación
# style: Estilos (no afecta lógica)
# refactor: Refactorización
# test: Tests
# chore: Tareas de mantenimiento
```

---

## 🌿 Git Workflow

### Ramas

```bash
# main - Rama principal (producción)
# develop - Rama de desarrollo
# feature/nombre - Nuevas características
# fix/nombre - Correcciones
```

### Flujo de Trabajo

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: Descripción clara"

# 3. Push a tu fork
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub
# Describir cambios claramente
```

---

## 📝 Estándares de Documentación

### Comentarios en Código

```javascript
/**
 * Descripción breve de la función
 * 
 * @param {string} cedula - Número de cédula del afiliado
 * @param {number} valor - Valor de la cuota
 * @returns {Promise<Object>} Cuota creada
 * @throws {Error} Si la cédula no existe
 */
async function crearCuota(cedula, valor) {
  // Implementación
}
```

### README de Nuevas Features

Si agregas un módulo grande, incluir documentación:

```markdown
# Módulo de Reportes

## Descripción
Generación de reportes en PDF/Excel...

## Uso
```javascript
import { generarReporte } from './reportes';
```

## API
...
```

---

## 🧪 Testing (Futuro)

Actualmente el proyecto no tiene tests automatizados. Si contribuyes con tests:

```bash
# Instalar Jest (ejemplo)
npm install --save-dev jest @testing-library/react

# Crear tests
// MiComponente.test.jsx
import { render, screen } from '@testing-library/react';
import MiComponente from './MiComponente';

test('renderiza correctamente', () => {
  render(<MiComponente />);
  expect(screen.getByText('Texto')).toBeInTheDocument();
});
```

---

## 📊 Pull Request Checklist

Antes de enviar un PR, asegúrate de:

- [ ] El código compila sin errores
- [ ] No hay console.log innecesarios
- [ ] Código formateado correctamente
- [ ] Comentarios actualizados
- [ ] README actualizado si es necesario
- [ ] Sin archivos `.env` en el commit
- [ ] Cambios probados localmente
- [ ] Commits con mensajes descriptivos

---

## ❓ Preguntas y Soporte

Para dudas sobre el proyecto:

📧 **Email:** ossy2607@gmail.com  
🐙 **GitHub Issues:** [Link a issues]  
💬 **LinkedIn:** [tu-linkedin]

---

## 📜 Código de Conducta

### Expectativas

✅ **Ser respetuoso** con otros colaboradores  
✅ **Comunicación clara** en issues y PRs  
✅ **Código de calidad** siguiendo convenciones  
✅ **Documentación** de cambios importantes  

❌ **No toleramos:**
- Spam o contenido irrelevante
- Código malicioso
- Violación de licencias
- Comportamiento no profesional

---

## 🎯 Áreas de Contribución Futuras

Si deseas contribuir, áreas sugeridas:

### Alta Prioridad
- [ ] Tests unitarios e integración
- [ ] Mejoras de performance
- [ ] Optimización de queries SQL
- [ ] Accesibilidad (ARIA labels, etc.)

### Media Prioridad
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Exportación reportes PDF
- [ ] Dashboard analytics avanzado

### Baja Prioridad
- [ ] Temas visuales (dark mode)
- [ ] Internacionalización (i18n)
- [ ] Aplicación móvil nativa
- [ ] Integración con APIs externas

---

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia MIT del proyecto.

Ver: [`LICENSE`](LICENSE)

---

## 🙏 Agradecimientos

Este proyecto fue desarrollado completamente por **Omar Santiago Salazar** desde cero, implementando buenas prácticas de desarrollo, arquitectura limpia y tecnologías modernas.

Si encuentras útil este proyecto, considera:
- ⭐ Dar una estrella en GitHub
- 📣 Compartir con otros
- 🐛 Reportar bugs si encuentras alguno

---

**Última actualización:** Febrero 2026  
**Mantenido por:** Omar Santiago Salazar

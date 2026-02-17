# 📦 SINDESCOL - Guía de Instalación y Uso

## Versión del Instalador: 1.0.0

---

## ✅ **Requisitos Previos**

Antes de instalar SINDESCOL, asegúrate de tener:

- **Windows 7 o superior** (64 bits recomendado)
- **Conexión a Internet** (necesaria para la base de datos en Railway)
- **Puerto 4000 disponible** (usado por el servidor backend local)
- **Puerto 3000 disponible** (sistema rara vez lo usa, pero reservado)

## 📥 **Instalación**

### Opción A: Instalador Tradicional (Recomendado)

1. Descarga: **`SINDESCOL-1.0.0-x64.exe`**
2. Haz doble clic en el archivo
3. Sigue el asistente de instalación
4. Elig una carpeta de destino (recomendado dejar la predeterminada)
5. Selecciona crear acceso directo en el escritorio
6. Haz clic en **Instalar**
7. Espera a que termine (puede tomar 1-2 minutos)
8. La aplicación se abrirá automáticamente

### Opción B: Versión Portátil (Sin instalación)

1. Descarga: **`SINDESCOL-1.0.0-portable.exe`**
2. Copia el archivo a la carpeta donde desees usarlo
3. Haz doble clic para ejecutar
4. No requiere instalación, puedes ejecutarlo desde cualquier lugar

---

## 🚀 **Primer Inicio**

Cuando abres SINDESCOL por primera vez:

1. La aplicación **iniciará automáticamente** el servidor backend local
2. Espera **10-15 segundos** a que todo cargue
3. Verás la pantalla de **Login**

### ⚠️ Si ves error de conexión:
```
POST http://localhost:4000/api/auth/login net::ERR_CONNECTION_REFUSED
```

**Significa:**
- El servidor backend está tardando en iniciar
- Espera 5 segundos más
- Recarga la página (F5)

---

## 🔐 **Credenciales de Acceso**

Usa las credenciales que fueron registradas en el sistema:

- **Email:** tu.email@ejemplo.com
- **Password:** tu contraseña

> 💡 **Nota:** Si es el primer acceso, solicita las credenciales al administrador

### Opciones de Login:

- ✅ **Recuérdame:** Guarda tu sesión por 30 días
- ❌ Sin marcar: Sesión temporal (cerrada al reiniciar)

---

## 📁 **Estructura de la Aplicación**

Después de instalar, encontrarás:

```
C:\Program Files (x86)\SINDESCOL\       (o tu carpeta elegida)
├── SINDESCOL.exe                       (Aplicación principal)
├── resources/
│   ├── backend.exe                     (Servidor backend local)
│   └── .env                            (Configuración de BD)
└── ...otros archivos
```

---

## 🔧 **Configuración**

### Base de Datos

La aplicación está **preconfigurada** para conectarse a:
- 🌐 **Railway** (servicio de hosting)
- Base de datos: SINDESCOL
- Las credenciales están en el archivo `.env` (interno)

### No requiere configuración manual

Todo está listo para funcionar al instalar.

---

## ⚡ **Uso Diario**

### Iniciar la Aplicación

1. Haz doble clic en el icono de **SINDESCOL** en el escritorio
2. O desde el menú Inicio: `Programas > SINDESCOL`

### La aplicación corre completamente local

- ✅ Frontend en `localhost:3000` (interno, no accesible)
- ✅ Backend en `localhost:4000` (interno, no accesible)
- ✅ BD remota en Railway (necesita internet)

### Cerrar correctamente

1. Haz clic en **Cerrar sesión** en la aplicación
2. Cierra la ventana
3. El servidor backend se detiene automáticamente

---

## 🐛 **Solución de Problemas**

### Error: "No se puede conectar al servidor"
**Causa:** El servidor backend tardó en iniciar
**Solución:** 
- Espera 10 segundos
- Recarga la página (F5)
- Cierra completamente la app y reabre

### Error: "No hay conexión a la BD"
**Causa:** Sin internet o Railway está caído
**Solución:**
- Verifica tu conexión a internet
- Intenta en unos minutos
- Contacta al administrador

### La aplicación no abre
**Causa:** Conflicto con antivirus o puertos ocupados
**Solución:**
- Desactiva temporalmente el antivirus
- Comprueba que puerto 4000 esté libre:
  ```powershell
  netstat -ano | findstr :4000
  ```
- Reinicia tu computadora
- Reinstala la aplicación

### Error: "Permiso denegado"
**Causa:** Falta de permisos administrativos
**Solución:**
- Haz clic derecho en el instalador
- Selecciona **"Ejecutar como administrador"**

---

## 🔄 **Desinstalación**

Para desinstalar SINDESCOL:

### Con el instalador tradicional:
1. Ve a **Panel de Control > Programas > Desinstalar programas**
2. Busca **SINDESCOL**
3. Haz clic en **Desinstalar**
4. Confirma

### Con versión portátil:
- Solo elimina el archivo `.exe`

---

## 📞 **Soporte**

Si tienes problemas:

1. Consulta la sección **"Solución de Problemas"** arriba
2. Contacta al administrador del sistema
3. Proporciona:
   - Sistema operativo (Win7/10/11)
   - Versión de SINDESCOL (1.0.0)
   - Error exacto que ves
   - Pasos para reproducir el problema

---

## ✨ **Características Principales**

- ✅ **Gestión de Afiliados** - Registro y seguimiento
- ✅ **Cuotas y Pagos** - Control financiero
- ✅ **Reportes** - Análisis de datos
- ✅ **Seguridad** - Autenticación e inicio de sesión
- ✅ **Funciona Offline** - (Excepto la BD)
- ✅ **Actualización Automática** - (Próximamente)

---

## 📋 **Versión: 1.0.0**
**Fecha:** Febrero 2026  
**Licencia:** MIT  
**Contacto:** ossy2607@gmail.com

---

### ¡Gracias por usar SINDESCOL! 🙏

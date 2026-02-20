# 🚀 Guía de Deployment - SINDESCOL

## 📋 Pre-requisitos

- [ ] Cuenta de Railway activa
- [ ] MySQL database creado en Railway
- [ ] Repositorio GitHub conectado a Railway
- [ ] Variables de entorno configuradas

---

## 🔧 Paso 1: Configurar Variables de Entorno en Railway

### Backend
```bash
NODE_ENV=production
DATABASE_URL=<auto-generado por Railway>
PORT=4000
JWT_SECRET=<generar secreto seguro>
CORS_ORIGIN=https://tu-frontend.com

# Rate Limiting (opcional)
RATE_LIMIT_WHITELIST=123.45.67.89,98.76.54.32

# Email (si usas soporte)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-app
```

### Frontend (si aplica)
```bash
VITE_API_URL=https://tu-backend.railway.app
```

---

## 📊 Paso 2: Optimizar Base de Datos (CRÍTICO)

### 2.1 Ejecutar Script de Índices

**Opción A: Desde Railway CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ejecutar script
railway run mysql -u <user> -p railway < backend/database/optimize_indexes.sql
```

**Opción B: Desde MySQL Client**
```bash
# Conectar a Railway MySQL
mysql -h <railway-host> -u <user> -p railway

# Copiar y pegar el contenido de optimize_indexes.sql
# O desde tu editor SQL favorito
```

**Opción C: Desde Railway Dashboard**
1. Ve a tu servicio MySQL en Railway
2. Clic en "Data" tab
3. Clic en "Query"
4. Copiar y pegar contenido de `optimize_indexes.sql`
5. Ejecutar

### 2.2 Verificar Índices
```sql
-- Verificar que se crearon correctamente
SHOW INDEX FROM afiliados;
SHOW INDEX FROM cuotas;
SHOW INDEX FROM usuarios;

-- Debe mostrar múltiples índices por tabla
```

---

## 🏗️ Paso 3: Build y Deploy Backend

### 3.1 Configurar Railway.toml (opcional)
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### 3.2 Deploy Automático
```bash
# Push a GitHub (Railway detecta y builds automáticamente)
git add .
git commit -m "feat: optimizaciones para 500+ usuarios"
git push origin main

# Railway inicia build automáticamente
```

### 3.3 Deploy Manual (si es necesario)
```bash
# Desde Railway CLI
railway up

# O desde Railway Dashboard
# Settings → Deploy → Manual Deploy
```

---

## 🌐 Paso 4: Build y Deploy Frontend

### 4.1 Actualizar Variables de Entorno
```javascript
// frontend/.env.production
VITE_API_URL=https://tu-backend.railway.app
```

### 4.2 Deploy a Vercel/Netlify (Recomendado)

**Vercel:**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### 4.3 O Deploy todo en Railway
```bash
# Crear servicio separado para frontend en Railway
# Build command: npm run build
# Start command: npm run preview
```

---

## ✅ Paso 5: Verificar Deployment

### 5.1 Health Checks
```bash
# Check básico
curl https://tu-backend.railway.app/api/health

# Check detallado
curl https://tu-backend.railway.app/api/health/detailed

# Métricas
curl https://tu-backend.railway.app/api/metrics
```

**Respuesta esperada health/detailed:**
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy" },
    "cache": { "status": "healthy" },
    "memory": { "status": "healthy", "usage": { "heapUsed_mb": 150 } }
  }
}
```

### 5.2 Verificar Rate Limiting
```bash
# Intentar 10 logins rápidos (debe bloquear después de 5)
for i in {1..10}; do
  curl -X POST https://tu-backend.railway.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done

# Debe responder "Demasiados intentos..." después del 5to
```

### 5.3 Verificar Caché
```bash
# Logs en Railway deben mostrar:
✅ Cache hit: all_cargos
✅ Cache hit: all_municipios
# Después de primer request
```

---

## 📈 Paso 6: Monitoreo Post-Deploy

### 6.1 Configurar Monitoreo Automático

**UptimeRobot (Free):**
1. Crear cuenta en [uptimerobot.com](https://uptimerobot.com)
2. Agregar monitor HTTP(s):
   - URL: `https://tu-backend.railway.app/api/health`
   - Interval: 5 minutos
   - Alert: Email cuando down

**Configurar Alertas de RAM:**
```bash
# Crear script de monitoreo (ejecutar cada 5 min con cron/GitHub Actions)
#!/bin/bash

MEMORY=$(curl -s https://tu-backend.railway.app/api/metrics | jq '.memory.formatted.heapUsed_mb')

if [ "$MEMORY" -gt 400 ]; then
  echo "⚠️ ALERTA: Uso de RAM alto: ${MEMORY}MB"
  # Enviar email/Slack notification
fi
```

### 6.2 Dashboard de Métricas

Crear dashboard simple con estas URLs:
- Health: `https://tu-backend.railway.app/api/health/detailed`
- Metrics: `https://tu-backend.railway.app/api/metrics`
- DB Stats: `https://tu-backend.railway.app/api/metrics/db`

### 6.3 Logs en Railway
```bash
# Ver logs en tiempo real
railway logs

# O desde Railway Dashboard → Logs
```

---

## 🔍 Paso 7: Testing de Carga (Recomendado)

### 7.1 Test con Artillery
```bash
npm install -g artillery

# Crear test basic
cat > load-test.yml << EOF
config:
  target: "https://tu-backend.railway.app"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
scenarios:
  - name: "Get afiliados"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@test.com"
            password: "password123"
          capture:
            json: "$.token"
            as: "token"
      - get:
          url: "/api/afiliados"
          headers:
            Authorization: "Bearer {{ token }}"
EOF

# Ejecutar test
artillery run load-test.yml
```

### 7.2 Interpretar Resultados
- **Response time p95 < 500ms:** ✅ Excelente
- **Response time p95 < 1000ms:** ✅ Aceptable
- **Response time p95 > 2000ms:** ⚠️ Revisar índices/caché
- **Errors > 1%:** 🔴 Problema crítico

---

## 🚨 Troubleshooting Común

### Error: "Too many connections"
**Solución:**
```javascript
// backend/src/config/db.js
connectionLimit: 12  // Reducir de 15
```

### Error: "Out of memory"
**Solución:**
1. Verificar caché no excesivo: `/api/metrics`
2. Reducir `maxKeys` en cache.js
3. Considerar upgrade a Railway Pro

### Error: "503 Service Unavailable"
**Solución:**
1. Verificar logs: `railway logs`
2. Check health: `/api/health/detailed`
3. Restart: Railway Dashboard → Settings → Restart

### Queries lentos después de índices
**Solución:**
```sql
-- Actualizar estadísticas
ANALYZE TABLE afiliados;
ANALYZE TABLE cuotas;
ANALYZE TABLE usuarios;
```

---

## 📊 Paso 8: Optimizaciones Opcionales

### 8.1 Comprimir Respuestas
```bash
cd backend
npm install compression

# En app.js
import compression from 'compression';
app.use(compression());
```

### 8.2 Habilitar HTTP/2 (Railway soporta)
```javascript
// Ya habilitado en Railway por defecto
// Verificar headers: curl -I https://tu-backend.railway.app
```

### 8.3 CDN para Assets Estáticos
```javascript
// Mover fotos a Cloudinary
// Ver: https://cloudinary.com/documentation/node_integration
```

---

## 📋 Checklist Final

### Pre-Deploy
- [ ] Script de índices ejecutado
- [ ] Variables de entorno configuradas
- [ ] Tests pasando localmente
- [ ] CORS configurado correctamente
- [ ] JWT_SECRET seguro generado
- [ ] .env files en .gitignore

### Post-Deploy
- [ ] `/api/health/detailed` retorna "healthy"
- [ ] `/api/metrics` muestra memoria < 400MB
- [ ] Rate limiting funciona (test login)
- [ ] Caché funciona (ver logs)
- [ ] Frontend conecta con backend
- [ ] Usuarios pueden login/logout
- [ ] Queries responden rápido (< 500ms)

### Monitoreo
- [ ] UptimeRobot configurado
- [ ] Alertas de RAM configuradas
- [ ] Dashboard de métricas accesible
- [ ] Logs revisados diariamente (primera semana)
- [ ] Plan de upgrade decidido

---

## 🎯 Métricas de Éxito

Después del deployment, estos son los objetivos:

| Métrica | Objetivo | Acción si no cumple |
|---------|----------|---------------------|
| Uptime | > 99.5% | Verificar logs, considerar upgrade |
| Response time (p95) | < 500ms | Revisar índices, caché |
| Memoria | < 400MB | Reducir caché, optimizar queries |
| Cache hit ratio | > 80% | Aumentar TTL, revisar keys |
| Errores 5xx | < 0.1% | Revisar logs, fix bugs |
| Conexiones BD | < 10 idle | Optimizar queries, agregar caché |

---

## 📞 Soporte

**Issues frecuentes:** [GitHub Issues](https://github.com/OmarSsalazar/Sindescol/issues)  
**Documentación:** [docs/SCALING.md](./SCALING.md)  
**Contacto:** ossy2607@gmail.com

---

## 🎉 ¡Deployment Exitoso!

Si llegaste aquí y todos los checks están ✅, ¡felicitaciones!

Tu aplicación está lista para 500+ usuarios con:
- ✅ Base de datos optimizada
- ✅ Pool de conexiones configurado
- ✅ Rate limiting activo
- ✅ Caché implementado
- ✅ Monitoreo funcionando

**Próximos pasos:**
1. Monitorear métricas la primera semana
2. Ajustar límites según uso real
3. Planificar upgrade cuando sea necesario
4. Compartir feedback y mejoras

---

**¡Buena suerte con tu proyecto! 🚀**

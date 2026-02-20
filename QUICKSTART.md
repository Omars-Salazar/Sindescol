# QUICKSTART - Deployment en 5 Pasos

## ⚡ Deployment Rápido a Railway

### Paso 1: Instalar Railway CLI
```powershell
npm install -g @railway/cli
railway login
```

### Paso 2: Deploy
```powershell
cd backend
.\scripts\deploy-railway.ps1
```
Sigue las instrucciones en pantalla.

### Paso 3: Ejecutar Índices en BD (CRÍTICO)
```powershell
.\scripts\execute-indexes-railway.ps1
```
O manualmente desde Railway Dashboard → MySQL → Data → Query.

### Paso 4: Verificar
```powershell
.\scripts\verify-deployment.ps1 -AppUrl "https://tu-app.railway.app"
```

### Paso 5: Configurar Variables de Entorno en Railway
En Railway Dashboard → Settings → Variables:
- `NODE_ENV=production`
- `JWT_SECRET=<tu-secreto-seguro>`
- `CORS_ORIGIN=https://tu-frontend.com`

## ✅ ¡Listo!

Tu aplicación está corriendo con:
- ✅ 40+ índices de BD
- ✅ Rate limiting activo
- ✅ Caché optimizado
- ✅ Pool de conexiones configurado

## 📊 Monitoreo

Ver métricas en tiempo real:
```powershell
.\scripts\monitor-production.ps1 -AppUrl "https://tu-app.railway.app"
```

## 📚 Más Info

- [Scripts README](scripts/README.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Scaling Guide](docs/SCALING.md)

# Logs de Monitoreo

Este directorio contiene logs generados por el script `monitor-production.ps1`.

**Formato:** `monitor-YYYY-MM-DD.csv`

## Estructura del CSV

```
timestamp,status,memory_mb,pool_free,cache_keys,cache_hit_ratio
2026-02-19 10:30:00,healthy,245,12,85,92.3
2026-02-19 10:31:00,healthy,248,11,87,93.1
```

## Retención

Recomendado: Mantener últimos 30 días, eliminar logs antiguos para ahorrar espacio.

## .gitignore

Los archivos `.csv` en este directorio están ignorados por Git.

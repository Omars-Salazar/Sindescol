# Contingency Worker (Cloudflare)

Este worker recibe solicitudes de soporte cuando el backend principal no esta disponible y las reenvia a canales externos independientes.

## Flujo

1. Frontend intenta enviar al backend principal.
2. Si falla, envia al Cloudflare Worker.
3. Worker reenvia a uno o dos webhooks externos.
4. Si tampoco hay respuesta, el frontend abre `mailto` como ultimo recurso.

## Requisitos

- Cuenta Cloudflare
- Node.js 18+
- Wrangler CLI

## Configuracion rapida para app local (sin dominio)

Si la app funciona local (desktop) y no tienes dominio web, usa esta base en `wrangler.toml`:

- `ALLOWED_ORIGIN = "*"`
- `SUPPORT_TOKEN = "<tu-token-largo>"`
- `PRIMARY_ALERT_WEBHOOK_URL = "<url-webhook-make-o-zapier>"`
- `SECONDARY_ALERT_WEBHOOK_URL = ""` (opcional)
- `WEBHOOK_TIMEOUT_MS = "8000"`

En ese escenario la seguridad principal la aporta `SUPPORT_TOKEN`.

## 1) Instalar Wrangler

```bash
npm install -g wrangler
```

## 2) Autenticar

```bash
wrangler login
```

## 3) Configurar el worker

Dentro de esta carpeta:

```bash
copy wrangler.toml.example wrangler.toml
```

Edita `wrangler.toml` y completa:

- `ALLOWED_ORIGIN`: dominio del frontend (ej. `https://app.tudominio.com`)
- `SUPPORT_TOKEN`: token secreto compartido
- `PRIMARY_ALERT_WEBHOOK_URL`: webhook principal
- `SECONDARY_ALERT_WEBHOOK_URL`: webhook secundario (opcional)

### De donde sale `PRIMARY_ALERT_WEBHOOK_URL` en Make

1. Entra a Make y crea un Scenario nuevo.
2. Agrega modulo Webhooks > Custom webhook.
3. Crea el webhook y copia la URL que Make muestra.
4. Esa URL va en `PRIMARY_ALERT_WEBHOOK_URL`.
5. Agrega un modulo Gmail (o Email) para enviar el contenido recibido.
6. Enciende el Scenario.

## 4) Desplegar

```bash
wrangler deploy
```

Cloudflare devolvera una URL similar a:

`https://sindescol-support-contingency.<tu-subdominio>.workers.dev`

## 5) Configurar frontend

En `frontend/.env` agrega:

```env
VITE_SUPPORT_FALLBACK_WEBHOOK_URL=https://sindescol-support-contingency.<tu-subdominio>.workers.dev/support-request
VITE_SUPPORT_FALLBACK_TOKEN=<mismo-token-del-worker>
VITE_SUPPORT_EMERGENCY_EMAIL=soportesindescol@gmail.com
```

Si tu app es local, tambien funciona igual. Solo cambia la URL por la que te entregue `wrangler deploy`.

## 6) Probar

Con backend apagado, intenta enviar el formulario:

- Si webhook responde: veras mensaje de envio por contingencia.
- Si webhook falla: se abrira el correo de emergencia.

## Sugerencias de canal de salida

- Make webhook custom
- Zapier catch hook
- n8n webhook cloud
- Discord incoming webhook
- Slack incoming webhook

## Seguridad recomendada

- Mantener `SUPPORT_TOKEN` activo
- Definir `ALLOWED_ORIGIN` especifico (no usar `*` en produccion)
- Rotar token periodicamente
- Revisar logs de Cloudflare regularmente
